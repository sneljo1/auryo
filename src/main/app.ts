import { receiveProtocolAction, resolveSoundCloudUrl } from '@common/store/actions';
import { isSoundCloudUrl } from '@common/utils';
// eslint-disable-next-line import/no-unresolved
import { StoreState } from 'AppReduxTypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, BrowserWindowConstructorOptions, Event, Menu, shell } from 'electron';
import { stopForwarding } from 'electron-redux';
import windowStateKeeper from 'electron-window-state';
import _ from 'lodash';
import * as querystring from 'querystring';
import { Store } from 'redux';
// eslint-disable-next-line import/no-cycle
import { Feature } from './features/feature';
import { Logger, LoggerInstance } from './utils/logger';
import { Utils } from './utils/utils';

export class Auryo {
  public mainWindow: Electron.BrowserWindow | undefined;
  public store: Store<StoreState>;
  public quitting = false;
  private readonly logger: LoggerInstance = Logger.createLogger(Auryo.name);

  constructor(mainStore: Store<StoreState>) {
    this.store = mainStore;
  }

  public setStore(store: Store<StoreState>) {
    this.store = store;
  }

  public setQuitting(quitting: boolean) {
    this.quitting = quitting;
  }

  public async start() {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1190,
      defaultHeight: 728
    });

    // Browser Window options
    const mainWindowOption: BrowserWindowConstructorOptions = {
      title: `Auryo - ${app.getVersion()}`,
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
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: process.env.NODE_ENV !== 'development',
        contextIsolation: false, // We recommend enabling contextIsolation for security.
        enableRemoteModule: true // Maybe wecan work this out later
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

  public handleProtocolUrl(url: string) {
    if (!url) return;

    const { action, search } = url.match(/auryo:\/\/(?<action>(\w|-)*)\/?(\?(?<search>.*))?/)?.groups ?? {};
    const params = search ? (querystring.parse(search) as Record<string, unknown>) : {};

    if (!action) return;

    this.logger.debug({ action, params }, 'handleProtocolUrl');

    this.store.dispatch(stopForwarding(receiveProtocolAction({ action, params })));
  }

  private registerTools() {
    const { getTools } = require('./features'); // eslint-disable-line

    const featuresWaitUntil = _.groupBy(getTools(this), 'waitUntil');

    const registerFeature = (feature: Feature) => {
      this.logger.debug(`Registering feature: ${feature.featureName}`);
      try {
        feature.register();
      } catch (error) {
        this.logger.error(`Error starting feature: ${feature.featureName}`, error);
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

    await this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    this.mainWindow.webContents.on('will-navigate', async (event, url) => {
      event.preventDefault();

      try {
        if (/^(https?:\/\/)/g.exec(url) !== null) {
          if (isSoundCloudUrl(url)) {
            this.store.dispatch(resolveSoundCloudUrl(url));
          } else {
            await shell.openExternal(url);
          }
        } else if (/^mailto:/g.exec(url) !== null) {
          await shell.openExternal(url);
        }
      } catch (err) {
        this.logger.error('Error handling will navigate', err);
      }
    });

    this.mainWindow.webContents.on('new-window', async (e, u) => {
      e.preventDefault();
      try {
        if (/^(https?:\/\/)/g.exec(u) !== null) {
          await shell.openExternal(u);
        }
      } catch (err) {
        this.logger.error('Error handling new window', err);
      }
    });
  }

  private readonly registerListeners = () => {
    if (this.mainWindow) {
      this.mainWindow.webContents.on('render-process-gone', (event: Event) => {
        this.logger.fatal('Render process gone', event);
      });

      this.mainWindow.on('unresponsive', (event: Event) => {
        this.logger.fatal('App unresponsive', event);
      });

      this.mainWindow.on('closed', () => {
        this.mainWindow = undefined;
      });

      this.mainWindow.on('close', (event) => {
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
