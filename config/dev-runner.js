process.env.NODE_ENV = 'development'

const ora = require('ora')
const rm = require('rimraf')
const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')

const mainConfig = require('./webpack.main')
const rendererConfig = require('./webpack.renderer.dev')

let port = process.argv[2] || 8080
process.env.DEV_PORT = port

let electronProcess = null

function startRender() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(rendererConfig)

    const server = new webpackDevServer(compiler, {
      contentBase: path.resolve(__dirname, '../dist'),
      quiet: true,
      hot: true
    })

    server.listen(port)

    resolve()
  })
}

function startMain() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(mainConfig)

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log('here error: ', err)
        reject(err)
      }

      if (electronProcess && electronProcess.kill) {
        process.kill(electronProcess.pid)
        electronProcess = null
        startElectron()
      }

      resolve()
    })
  })
}

function startElectron() {
  electronProcess = spawn(electron, [
    '--inspect=5858',
    path.join(__dirname, '../dist/main.js')
  ])

  electronProcess.stdout.on('data', data => console.log(chalk["blue"].bold('E=>'), data.toString()))
  electronProcess.stderr.on('data', data => console.log(chalk["red"].bold('E=>'), data.toString()))
}

const spinner = ora('Building dev-server...\n\n')
spinner.start()

rm(path.resolve(__dirname, '../dist'), err => {
  if (err) {
    throw new Error(err)
  }

  Promise.all([startRender(), startMain()])
    .then(() => spinner.stop() && startElectron())
    .catch(err => console.log(err))
})
