import { StoreState } from '@common/store';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, ipcMain } from 'electron';
import { isEqual } from 'lodash';
import { Store } from 'redux';
import ReduxWatcher from 'redux-watcher';
// eslint-disable-next-line import/no-cycle
import { Auryo } from '../app';

export type Handler<T> = (t: {
  store: Store<StoreState>;
  selector: string | string[];
  prevState: StoreState;
  currentState: StoreState;
  prevValue: T;
  currentValue: T;
}) => void;

export interface WatchState<T> {
  store: Store<StoreState>;
  selector: string | string[];
  prevState: StoreState;
  currentState: StoreState;
  prevValue: T;
  currentValue: T;
}

export class Feature {
  public readonly featureName: string = 'Feature';
  public timers: any[] = [];
  public win: BrowserWindow | null = null;
  public store: Store<StoreState>;
  public watcher: any;
  private readonly listeners: { path: string[]; handler: Function }[] = [];
  private readonly ipclisteners: { name: string; handler: Function }[] = [];

  constructor(protected app: Auryo, protected waitUntil: string = 'default') {
    if (app.mainWindow) {
      this.win = app.mainWindow;
    }
    this.store = app.store;

    this.watcher = new ReduxWatcher(app.store);
  }

  public subscribe<T>(path: string[], handler: Handler<T>) {
    this.watcher.watch(path, handler);

    this.listeners.push({
      path,
      handler
    });
  }

  public sendToWebContents(channel: string, params?: any) {
    if (this.win && this.win.webContents) {
      this.win.webContents.send(channel, params, this.constructor.name);
    }
  }

  public on(path: string, handler: any) {
    ipcMain.on(path, (_: any, ...args: any[]) => {
      handler(args);
    });

    this.ipclisteners.push({
      name: path,
      handler
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public register() {}

  public unregister(path?: string[] | string) {
    if (path) {
      const ipcListener = this.ipclisteners.find(l => isEqual(l.name, path));

      if (typeof path === 'string') {
        if (ipcListener) {
          ipcMain.removeAllListeners(ipcListener.name);
        }
      } else {
        const listener = this.listeners.find(l => isEqual(l.path, path));

        if (listener) {
          this.watcher.off(listener.path, listener.handler);
        }
      }
    } else {
      this.listeners.forEach(listener => {
        try {
          this.watcher.off(listener.path, listener.handler);
        } catch (err) {
          if (!err.message.startsWith('No such listener for')) {
            throw err;
          }
        }
      });

      this.ipclisteners.forEach(listener => {
        ipcMain.removeAllListeners(listener.name);
      });
    }

    this.timers.forEach(timeout => {
      clearTimeout(timeout);
    });
  }

  // eslint-disable-next-line
  public shouldRun() {
    return true;
  }
}
