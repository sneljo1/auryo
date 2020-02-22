import { Intent } from '@blueprintjs/core';
import fetchTrack from '@common/api/fetchTrack';
import { axiosClient } from '@common/api/helpers/axiosClient';
import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import { addToast, setConfigKey } from '@common/store/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, BrowserWindowConstructorOptions, Event, Menu, nativeImage, shell } from 'electron';
import is from 'electron-is';
import windowStateKeeper from 'electron-window-state';
import _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
import * as querystring from 'querystring';
import { Store } from 'redux';
import { Track } from 'src/types/soundcloud';
import { CONFIG } from '../config';
// eslint-disable-next-line import/no-cycle
import { Feature } from './features/feature';
import { Logger, LoggerInstance } from './utils/logger';
import { Utils } from './utils/utils';

const logosPath = path.resolve(global.__static, 'logos');

const icons = {
  256: nativeImage.createFromPath(path.join(logosPath, 'auryo.png')),
  128: nativeImage.createFromPath(path.join(logosPath, 'auryo-128.png')),
  64: nativeImage.createFromPath(path.join(logosPath, 'auryo-64.png')),
  48: nativeImage.createFromPath(path.join(logosPath, 'auryo-48.png')),
  32: nativeImage.createFromPath(path.join(logosPath, 'auryo-32.png')),
  ico: nativeImage.createFromPath(path.join(logosPath, 'auryo.ico')),
  tray: nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.png')).resize({ width: 24, height: 24 }),
  'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.ico')).resize({ width: 24, height: 24 })
};

export class Auryo {
  public mainWindow: Electron.BrowserWindow | undefined;
  public store: Store<StoreState>;
  public quitting = false;
  private readonly logger: LoggerInstance = Logger.createLogger(Auryo.name);

  constructor(store: Store<StoreState>) {
    this.store = store;

    app.setAppUserModelId('com.auryo.core');

    app.on('before-quit', () => {
      this.logger.info('Application exiting...');
      this.quitting = true;
    });

    const isPrimaryInstance = app.requestSingleInstanceLock();

    if (!isPrimaryInstance) {
      this.logger.debug(`Not the first instance - quit`);
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      // handle protocol for windows
      if (is.windows()) {
        process.argv.slice(1).forEach(arg => {
          this.handleProtocolUrl(arg);
        });
      }
    });
  }

  public async start() {
    if (this.quitting) {
      return;
    }

    app.setAsDefaultProtocolClient('auryo');

    app.on('open-url', (event, data) => {
      event.preventDefault();

      this.handleProtocolUrl(data);
    });

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
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: process.env.NODE_ENV !== 'development'
      }
    };

    // Create the browser window
    this.mainWindow = new BrowserWindow(Utils.posCenter(mainWindowOption));

    this.registerTools();

    this.registerListeners();

    mainWindowState.manage(this.mainWindow);

    this.mainWindow.setMenu(null);

    await this.loadMain();

    if (process.env.NODE_ENV === 'development' || process.env.ENV === 'development') {
      this.mainWindow.webContents.on('context-menu', (_e, props) => {
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

    this.logger.info('App started');
  }

  private handleProtocolUrl(url: string) {
    const action = url.replace('auryo://', '').match(/^.*(?=\?.*)/g);

    if (action && url.split('?').length) {
      const result = querystring.parse(url.split('?')[1]);

      switch (action[0]) {
        case 'launch':
          if (result.client_id && result.client_id.length) {
            this.store.dispatch(setConfigKey('app.overrideClientId', result.client_id));

            this.store.dispatch(
              addToast({
                message: `New clientId added`,
                intent: Intent.SUCCESS
              })
            );
          }
          break;
        default:
      }
    }
  }

  private registerTools() {
    const { getTools } = require('./features'); // eslint-disable-line

    const featuresWaitUntil = _.groupBy(getTools(this), 'waitUntil');

    const registerFeature = (feature: Feature) => {
      this.logger.debug(`Registering feature: ${feature.featureName}`);
      try {
        feature.register();
      } catch (error) {
        this.logger.error(error, `Error starting feature: ${feature.featureName}`);
      }
    };

    Object.keys(featuresWaitUntil).forEach((event: any) => {
      const features = featuresWaitUntil[event];

      features.forEach((feature: Feature) => {
        if (event === 'default') {
          registerFeature(feature);
        } else if (this.mainWindow) {
          this.mainWindow.on(event, registerFeature.bind(this, feature));
        }
      });
    });
  }

  private async loadMain() {
    if (!this.mainWindow) {
      this.logger.fatal('Unable to create window');
      app.quit();
      return;
    }

    const winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : `file://${__dirname}/index.html`;

    await this.mainWindow.loadURL(winURL);

    this.mainWindow.webContents.on('will-navigate', async (e, u) => {
      e.preventDefault();

      try {
        if (/^(https?:\/\/)/g.exec(u) !== null) {
          if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(u) !== null) {
            if (this.mainWindow) {
              this.mainWindow.webContents.send(EVENTS.APP.PUSH_NAVIGATION, '/resolve', u);
            }
          } else {
            await shell.openExternal(u);
          }
        } else if (/^mailto:/g.exec(u) !== null) {
          await shell.openExternal(u);
        }
      } catch (err) {
        this.logger.error(err);
      }
    });

    this.mainWindow.webContents.on('new-window', async (e, u) => {
      e.preventDefault();
      try {
        if (/^(https?:\/\/)/g.exec(u) !== null) {
          await shell.openExternal(u);
        }
      } catch (err) {
        this.logger.error(err);
      }
    });

    // SoundCloud's API gave a lot of 401s using the /stream to get the audio file
    // This is a hacky way to circumvent this :)
    this.mainWindow.webContents.session.webRequest.onBeforeRequest(
      {
        urls: ['http://localhost:8888/stream/*']
      },
      async (details, callback) => {
        const {
          config: {
            app: { overrideClientId }
          }
        } = this.store.getState();
        const { 1: trackId } = details.url.split('http://localhost:8888/stream/');
        try {
          const clientId = overrideClientId && overrideClientId.length ? overrideClientId : CONFIG.CLIENT_ID;
          const mp3Url = await this.getPlayingTrackStreamUrl(trackId, clientId || '');

          callback({
            redirectURL: mp3Url
          });
        } catch (err) {
          this.logger.error(err);
          callback({ cancel: true });
        }
      }
    );

    this.mainWindow.webContents.session.webRequest.onCompleted(details => {
      if (
        this.mainWindow &&
        (details.url.indexOf('/stream?client_id=') !== -1 || details.url.indexOf('cf-media.sndcdn.com') !== -1)
      ) {
        if (details.statusCode < 200 && details.statusCode > 300) {
          if (details.statusCode === 404) {
            this.store.dispatch(
              addToast({
                message: 'This resource might not exists anymore',
                intent: Intent.DANGER
              })
            );
          }
        }
      }
    });
  }

  public async getPlayingTrackStreamUrl(trackId: string, clientId: string) {
    const {
      entities: { trackEntities }
    } = this.store.getState();

    let track: Track = trackEntities[trackId];

    if (!track?.media?.transcodings) {
      const { json } = await fetchTrack(trackId);

      track = json;
    }

    const streamUrl = track?.media?.transcodings?.filter(
      (transcoding: any) => transcoding.format.protocol === 'progressive'
    )[0]?.url;

    if (!streamUrl) {
      return null;
    }

    const response = await axiosClient(`${streamUrl}?client_id=${clientId}`);
    const mp3Url = response.data.url;

    return mp3Url;
  }

  private readonly registerListeners = () => {
    if (this.mainWindow) {
      this.mainWindow.webContents.on('crashed', (event: Event) => {
        this.logger.fatal(event, 'App Crashed');
      });

      this.mainWindow.on('unresponsive', (event: Event) => {
        this.logger.fatal(event, 'App unresponsive');
      });

      this.mainWindow.on('closed', () => {
        this.mainWindow = undefined;
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
    }
  };
}
