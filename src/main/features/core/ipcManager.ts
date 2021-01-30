import { EVENTS } from '@common/constants/events';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, dialog, ipcMain } from 'electron';
import { download } from 'electron-dl';
import _ from 'lodash';
import { Logger, LoggerInstance } from '../../utils/logger';
import { Feature } from '../feature';

@autobind
export default class IPCManager extends Feature {
  public readonly featureName = 'IPCManager';
  public authWindow: Electron.BrowserWindow | null = null;
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);

  // tslint:disable-next-line: max-func-body-length
  public register() {
    ipcMain.on(EVENTS.APP.VALID_DIR, async () => {
      const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });

      if (res && res.filePaths && res.filePaths.length) {
        this.sendToWebContents(EVENTS.APP.VALID_DIR_RESPONSE, res.filePaths[0]);
      }
    });

    ipcMain.on(EVENTS.APP.RAISE, () => {
      if (this.win) {
        this.win.focus();
      }
    });
    ipcMain.on(EVENTS.APP.RELOAD, () => {
      if (this.win) {
        this.win.reload();
      }
    });

    ipcMain.on(EVENTS.APP.DOWNLOAD_FILE, (_e, url: string) => {
      const { config } = this.store.getState();

      const downloadSettings: any = {};

      if (!_.isEmpty(_.get(config, 'app.downloadPath'))) {
        downloadSettings.directory = config.app.downloadPath;
      }

      if (this.win) {
        download(this.win, url, downloadSettings)
          .then((dl) => this.logger.info('filed saved to', dl.getSavePath()))
          .catch(this.logger.error);
      }
    });
  }
}
