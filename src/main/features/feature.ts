import { BrowserWindow, ipcMain } from 'electron';
import isEqual from 'lodash/isEqual';
import { Store } from 'redux';
import * as ReduxWatcher from 'redux-watcher';
import { StoreState } from '../../shared/reducers';
import { Auryo } from '../app';
import { IFeature } from './feature.interface';

export default class Feature implements IFeature {
  private listeners: { path: string[]; handler: Function }[] = [];
  private ipclisteners: { name: string; handler: Function }[] = [];

  public timers: any[] = [];
  public win: BrowserWindow;
  public store: Store<StoreState>;
  public watcher: any;

  constructor(protected app: Auryo, protected waitUntil: string = 'default') {
    if (app.mainWindow) {
      this.win = app.mainWindow;
    }
    this.store = app.store;

    this.watcher = new ReduxWatcher(app.store);
  }

  subscribe(path: string[], handler: Function) {
    this.watcher.watch(path, handler);

    this.listeners.push({
      path,
      handler
    });
  }

  sendToWebContents(channel: string, params?: any) {
    if (this.win && this.win.webContents) {
      this.win.webContents.send(channel, params);
    }
  }

  on(path: string, handler: Function) {
    ipcMain.on(path, (event: any, ...args: any[]) => {
      handler(args);
    });

    this.ipclisteners.push({
      name: path,
      handler
    });
  }

  // tslint:disable-next-line:no-empty
  register() {}

  unregister(path?: string[] | string) {
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
        ipcMain.removeListener(listener.name, listener.handler);
      });
    }

    this.timers.forEach(timeout => {
      clearTimeout(timeout);
    });
  }

  // eslint-disable-next-line
  shouldRun() {
    return true;
  }
}
