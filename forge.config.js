const path = require('path');
const fs = require('fs');
const package = require('./package.json');

require('dotenv').config({ path: path.resolve(__dirname, '.env.build') });

const {
  utils: { fromBuildIdentifier }
} = require('@electron-forge/core');

const environment = process.env.NODE_ENV || 'development';
const isProd = environment === 'production';

if (process.env['WINDOWS_CODESIGN_FILE']) {
  const certPath = path.join(__dirname, 'win-certificate.pfx');
  const certExists = fs.existsSync(certPath);

  if (certExists) {
    process.env['WINDOWS_CODESIGN_FILE'] = certPath;
  }
}

module.exports = {
  buildIdentifier: isProd ? 'prod' : 'dev',
  packagerConfig: {
    asar: false,
    icon: path.resolve(__dirname, 'build/icons', 'icon'),
    appBundleId: fromBuildIdentifier({ dev: 'be.snlkx.dev.auryo', prod: 'be.snlkx.auryo' }),
    appCategoryType: 'public.app-category.music',
    win32metadata: {
      CompanyName: 'SNLKX',
      OriginalFilename: 'auryo'
    },
    osxSign: isProd && {
      identity: 'Developer ID Application: Jonas Snellinckx (R9R35P7KH5)',
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: 'assets/entitlements.plist',
      'entitlements-inherit': 'assets/entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: isProd && {
      appBundleId: 'be.snlkx.auryo',
      appleId: process.env['APPLE_ID'],
      appleIdPassword: process.env['APPLE_ID_KEY']
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: (arch) => {
        return {
          name: 'auryo',
          authors: 'Jonas Snellinckx',
          exe: 'auryo.exe',
          noMsi: true,
          remoteReleases: '',
          setupExe: `auryo-${package.version}-setup-${arch}.exe`,
          setupIcon: path.resolve(__dirname, 'build/icons', 'icon.ico'),
          certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
          certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD']
        };
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32']
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux']
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux']
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-snap',
      config: {
        features: {
          audio: true,
          mpris: 'be.snlkx.auryo.mpris',
          passwords: true
        },
        appConfig: {
          license: 'GPL-3.0-or-later'
        },
        appPlugs: [
          'dbus',
          'x11',
          'unity7',
          'upower-observe',
          'pulseaudio',
          'opengl',
          'network',
          'home',
          'gsettings',
          'browser-support',
          'bluez',
          'audio-playback'
        ],
        grade: isProd ? 'stable' : 'devel',
        confinement: isProd ? 'strict' : 'devmode',
        description: `Listen to SoundCloud® from the comfort of your desktop. Use keyboard shortcuts to navigate through your music. Be more productive.`,
        summary: 'A SoundCloud client for your desktop'
      }
    }
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.ejs',
              js: './src/renderer/index.tsx',
              name: 'main_window'
            }
          ]
        }
      }
    ]
  ]
};
