/* tslint:disable */

const path = require('path');
const package = require('./package.json');

module.exports = {
  hooks: {
    generateAssets: require('./tools/generateAssets')
  },
  packagerConfig: {
    name: 'Auryo',
    executableName: 'auryo',
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icons', '512x512'),
    // TODO: FIXME?
    // ignore: [
    //   /^\/\.vscode\//,
    //   /^\/tools\//
    // ],
    appBundleId: 'be.snellinckx.auryo',
    appCategoryType: 'public.app-category.music',
    // TODO add auryo scheme
    // protocols: [{ 
    //   name: 'Electron Fiddle Launch Protocol',
    //   schemes: ['electron-fiddle']
    // }],
    win32metadata: {
      CompanyName: 'Auryo',
      OriginalFilename: 'Auryo',
    }
  },
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   platforms: ['win32'],
    //   config: {
    //     name: 'electron-fiddle',
    //     authors: 'Electron Community',
    //     exe: 'electron-fiddle.exe',
    //     iconUrl: 'https://raw.githubusercontent.com/electron/fiddle/b5bf652df0ba159ec40a62001dbb298649c3b985/assets/icons/fiddle.ico',
    //     loadingGif: './assets/loading.gif',
    //     noMsi: true,
    //     remoteReleases: '',
    //     setupExe: `electron-fiddle-${package.version}-setup-${process.arch}.exe`,
    //     setupIcon: path.resolve(__dirname, 'assets', 'icons', 'fiddle.ico'),
    //     certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
    //     certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD
    //   }
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32']
    },
    {
      name: '@electron-forge/maker-dmg',
      // config: {
      //   background: './assets/dmg-background.png',
      //   format: 'UFLO'
      // }
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux']
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux']
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Superjo149',
          name: 'auryo'
        },
        prerelease: true
      }
    }
  ]
};
