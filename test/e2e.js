import { Application } from 'spectron'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import electron from 'electron'
import request from 'request'
import path from 'path'
import fs from 'fs'
import { setApp } from './utils'

chai.should()
chai.use(chaiAsPromised)

describe('Auryo e2e tests', function spec() {
        let app
        let token = null
        this.timeout(50000)

        async function getToken() {

            if (token) {
                return Promise.resolve(token)
            } else {

                const options = {
                    url: 'https://api.soundcloud.com/oauth2/token',
                    form: {
                        client_id: process.env.CLIENT_ID_DEV,
                        client_secret: process.env.CLIENT_SECRET_DEV,
                        grant_type: 'password',
                        username: process.env.SC_USER,
                        password: process.env.SC_PASS
                    }
                }

                return token = await new Promise((resolve, reject) => {
                    request.post(options, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            body = JSON.parse(body)
                            if (body.access_token) {
                                return resolve(body.access_token)
                            } else {
                                return reject(body)
                            }
                        }

                        reject(error)
                    })
                })

            }
        }


        beforeEach(() => {

            return getToken().then(token => {
                process.env.TOKEN = token
                process.env.NODE_ENV = 'test'

                app = new Application({
                    path: electron,
                    args: [path.join(__dirname, '..', 'src')],
                    env: {
                        TOKEN: token,
                        NODE_ENV: 'test'
                    }
                })

                setApp(app)

                return app.start()
                    .then(function (a) {
                        chaiAsPromised.transferPromiseness = a.transferPromiseness
                        return a
                    })
            })
                .catch((e) => {
                    console.log('wont start')
                    console.error(e)
                })


        })

        function importTest(name, path) {
            describe(name, function () {
                require(path)
            })
        }

        importTest('app', './e2e/app.js')
        importTest('pages', './e2e/pages.js')

        afterEach(function () {
            if (this.currentTest.state === 'failed') {
                app.browserWindow.capturePage().then(function (imageBuffer) {
                    fs.writeFile(path.join(__dirname, 'screenshots', new Date().getTime() + '.png'), imageBuffer)
                })

            }


            app.client.getRenderProcessLogs().then(function (logs) {
                if (logs.length) {
                    let str = ''
                    logs.forEach(function (log) {
                        if (log.level === 'ERROR') {
                            str += log.level + '|' + log.message + '\n'
                        }
                    })
                    if (str.length) {
                        console.log('RENDERER')
                        console.log(str + '\n')
                    }
                }
            })

            app.client.getMainProcessLogs().then(function (logs) {
                if (logs.length) {
                    console.log('MAIN')
                    let str = ''
                    logs.forEach(function (log) {
                        str += log + '\n'
                    })
                    console.log(str + '\n')
                }
            })

            if (app && app.isRunning()) {
                return app.stop()
            }
        })


    }
)