const Bundler = require('parcel-bundler');
const Path = require('path');
const app = require('express')();
const { run } = require('./run-bin');

// Entrypoint file location
const rendererFile = Path.resolve(__dirname, '../static/index.html');
const mainFile = Path.resolve(__dirname, '../src/main/index.ts');
const out = Path.resolve(__dirname, '../dist');

const options = {
  outDir: out, // The out directory to put the build files in, defaults to dist
  //   outFile: 'index.html', // The name of the outputFile
  publicUrl: out, // The url to server on, defaults to dist
  watch: true, // whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  cache: false, // Enabled or disables caching, defaults to true
  target: 'electron', // browser/node/electron, defaults to browser,

};

const mainOptions = {
  outDir: `${out}/main`, // The out directory to put the build files in, defaults to dist
  cache: false,
  target: 'electron', // browser/node/electron, defaults to browser,
  watch: false

};

async function runBundle() {


  try {
    await run('Rebuild native dep', 'electron-rebuild')

    const bundler = new Bundler(rendererFile, options);

    // Run the bundler, this returns the main bundle
    // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild

    const bundle = await bundler.bundle();
    console.log("bundle renderer\n", bundle.type)

    // Initializes a bundler using the entrypoint location and options provided
    const main = new Bundler(mainFile, mainOptions);

    const mainBundle = await main.bundle();
    console.log("bundle main\n", mainBundle.type)

    process.env.NODE_ENV = "development"

    await run('Start electron', 'electron', ['.'])

  } catch (err) {
    throw err;
  }
}

try {
  runBundle();
} catch (err) {
  throw err;
}