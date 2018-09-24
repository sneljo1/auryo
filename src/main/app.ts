import { app, BrowserWindow, Menu, nativeImage, shell, BrowserWindowConstructorOptions } from 'electron';
import * as windowStateKeeper from 'electron-window-state';
import * as os from 'os';
import * as path from 'path';
import { Store } from 'redux';
import { CONFIG } from '../config';
import { EVENTS } from '../shared/constants/events';
import { Logger } from './utils/logger';
import { StoreState } from '../shared/reducers';
import Feature from './features/feature';
import * as _ from 'lodash';
import { Utils } from './utils/utils';

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

let logosPath;

if (process.env.NODE_ENV === 'development') {
  logosPath = path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'logos');
} else {
  logosPath = path.resolve(__dirname, './assets/img/logos');
}

const icons = {
  '256': nativeImage.createFromPath(path.join(logosPath, 'auryo.png')),
  '128': nativeImage.createFromPath(path.join(logosPath, 'auryo-128.png')),
  '64': nativeImage.createFromPath(path.join(logosPath, 'auryo-64.png')),
  '48': nativeImage.createFromPath(path.join(logosPath, 'auryo-48.png')),
  '32': nativeImage.createFromPath(path.join(logosPath, 'auryo-32.png')),
  ico: nativeImage.createFromPath(path.join(logosPath, 'auryo.ico')),
  tray: nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.png')).resize({ width: 24, height: 24 }),
  'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.ico')).resize({ width: 24, height: 24 })
};

export class Auryo {
  private logger = new Logger('Main');

  public mainWindow: Electron.BrowserWindow | undefined;
  public store: Store<StoreState>;
  public quitting: boolean = false;

  constructor(store: Store<StoreState>) {
    this.store = store;

    app.setAppUserModelId('com.auryo.core');

    // Make the app a single-instance app
    const shouldQuit = app.makeSingleInstance(() => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) { this.mainWindow.restore(); }
        this.mainWindow.focus();
        this.mainWindow.show();
        this.mainWindow.setSkipTaskbar(false);
        if (app.dock && app.dock.show) { app.dock.show(); }
      }
    });

    if (shouldQuit) {
      app.exit();
    }
  }

  start() {
    this.logger.profile('app-start');

    const mainWindowState = windowStateKeeper({
      defaultWidth: 1190,
      defaultHeight: 728
    });

    // Browser Window options
    const mainWindowOption: BrowserWindowConstructorOptions = {
      title: `Auryo - ${app.getVersion()}`,
      icon: os.platform() === 'win32' ? icons.ico : icons['256'],
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 950,
      minHeight: 400,
      titleBarStyle: 'hiddenInset',
      show: false,
      fullscreen: mainWindowState.isFullScreen,
      webPreferences: {
        nodeIntegrationInWorker: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      }
    };

    // Create the browser window
    this.mainWindow = new BrowserWindow(Utils.posCenter(mainWindowOption));

    this.registerTools();

    mainWindowState.manage(this.mainWindow);

    this.mainWindow.setMenu(null);

    this.loadMain();

    this.mainWindow.on('closed', () => {
      this.mainWindow = undefined;
    });

    app.on('before-quit', () => {
      this.logger.info('Application exiting...');
      this.quitting = true;
    });

    this.mainWindow.on('close', event => {
      if (process.platform === 'darwin') {
        if (this.quitting) {
          this.mainWindow = undefined;
        } else {
          event.preventDefault();

          if (this.mainWindow) {
            this.mainWindow.hide();
          }
        }
      }
    });

    this.mainWindow.on('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
      }
    });

    if (process.env.NODE_ENV === 'development' || process.env.ENV === 'development') {
      this.mainWindow.webContents.on('context-menu', (e, props) => {
        const { x, y } = props;
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.inspectElement(x, y);
              }
            }
          },
          {
            label: 'Reload',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.reload();
              }
            }
          }
        ]).popup({ window: this.mainWindow });
      });

      if (process.env.OPEN_DEVTOOLS) {
        this.mainWindow.webContents.openDevTools();
      }
    }

    this.logger.profile('app-start');
    this.logger.info('App started');
  }

  registerTools() {
    const { getTools } = require('./features'); // eslint-disable-line

    const featuresWaitUntil = _.groupBy(getTools(this), 'waitUntil');

    const registerFeature = (feature: Feature) => {
      this.logger.debug(`Registering feature: ${feature.constructor.name}`);
      try {
        feature.register();
      } catch (e) {
        this.logger.error(`Error starting feature: ${feature.constructor.name}`, e);
      }
    };

    Object.keys(featuresWaitUntil).forEach((event: any) => {
      const features = featuresWaitUntil[event];

      features.forEach((feature: Feature) => {
        if (event === 'default') {
          registerFeature(feature);
        } else {
          if (this.mainWindow) {
            this.mainWindow.on(event, registerFeature.bind(this, feature));
          }
        }
      });
    });
  }

  loadMain() {
    if (this.mainWindow) {

      this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

      this.mainWindow.webContents.on('will-navigate', (e, u) => {
        e.preventDefault();

        if (/^(https?:\/\/)/g.exec(u) !== null) {
          if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(u) !== null) {
            if (this.mainWindow) {
              this.mainWindow.webContents.send('navigate', {
                pathname: '/resolve',
                search: '',
                hash: '',
                action: 'PUSH',
                key: 'resolve',
                query: {
                  url: escape(u)
                }
              });
            }
          } else {
            shell.openExternal(u);
          }
        } else if (/^mailto:/g.exec(u) !== null) {
          shell.openExternal(u);
        }
      });
      this.mainWindow.webContents.on('new-window', (e, u) => {
        e.preventDefault();
        if (/^(https?:\/\/)/g.exec(u) !== null) {
          shell.openExternal(u);
        }
      });

      this.mainWindow.webContents.session.webRequest.onCompleted(
        {
          urls: ['/stream?client_id=', 'cf-media.sndcdn.com']
        },
        details => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send(EVENTS.APP.STREAMED);

            if (details.statusCode < 200 && details.statusCode > 300) {
              this.mainWindow.webContents.send(EVENTS.APP.STREAM_ERROR, details.statusCode, details.url);
            }
          }
        }
      );

      this.mainWindow.webContents.session.webRequest.onErrorOccurred({ urls: ['*/stream?client_id=*'] }, details => {
        if (details.error === 'net::ERR_INTERNET_DISCONNECTED' && this.mainWindow) {
          this.mainWindow.webContents.send(EVENTS.APP.STREAM_ERROR, -1);
        }
      });
    }
  }
}