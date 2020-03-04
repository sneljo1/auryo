import { EVENTS } from '@common/constants/events';
import { setLoginError, setLoginLoading } from '@common/store/auth/actions';
import { setLogin } from '@common/store/config/actions';
import { createAuthWindow } from '@main/authWindow';
import { AWSApiGatewayService } from '@main/aws/awsApiGatewayService';
import { AWSIotService } from '@main/aws/awsIotService';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, clipboard, dialog, ipcMain, shell } from 'electron';
import { download } from 'electron-dl';
import _ from 'lodash';
import { CONFIG } from '../../../config';
import { Logger, LoggerInstance } from '../../utils/logger';
import { Feature } from '../feature';
@autobind
export default class IPCManager extends Feature {
  public readonly featureName = 'IPCManager';
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);

  private readonly awsApiGateway: AWSApiGatewayService = new AWSApiGatewayService();

  // tslint:disable-next-line: max-func-body-length
  public register() {
    ipcMain.on(EVENTS.APP.VALID_DIR, async () => {
      const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });

      if (res && res.filePaths && res.filePaths.length) {
        this.sendToWebContents(EVENTS.APP.VALID_DIR_RESPONSE, res.filePaths[0]);
      }
    });

    ipcMain.on(EVENTS.APP.RESTART, () => {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      app.exit(0);
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

    ipcMain.on(EVENTS.APP.OPEN_EXTERNAL, async (_e, arg) => {
      try {
        await shell.openExternal(arg);
      } catch (err) {
        this.logger.error(err);
      }
    });

    ipcMain.on(EVENTS.APP.WRITE_CLIPBOARD, (_e, arg: string) => {
      clipboard.writeText(arg);
    });

    ipcMain.on(EVENTS.APP.DOWNLOAD_FILE, (_e, url: string) => {
      const { config } = this.store.getState();

      const downloadSettings: any = {};

      if (!_.isEmpty(_.get(config, 'app.downloadPath'))) {
        downloadSettings.directory = config.app.downloadPath;
      }

      if (this.win) {
        download(this.win, url, downloadSettings)
          .then(dl => this.logger.info('filed saved to', dl.getSavePath()))
          .catch(this.logger.error);
      }
    });

    ipcMain.on(EVENTS.APP.AUTH.LOGIN, this.showAuthWindow);

    ipcMain.handle(EVENTS.APP.AUTH.REFRESH, this.refreshToken);
  }

  private async showAuthWindow() {
    const {
      auth: {
        authentication: { loading }
      }
    } = this.store.getState();
    let authWindow: Electron.BrowserWindow | null = null;
    let awsIotWrapper: AWSIotService | undefined;

    if (loading) {
      this.logger.debug('Already loading');
      return;
    }

    try {
      this.store.dispatch(setLoginLoading());

      this.logger.debug('Starting login');

      authWindow = createAuthWindow();

      authWindow.on('close', () => {
        this.store.dispatch(setLoginLoading(false));
      });

      const getKeysResponse = await this.awsApiGateway.getKeys();

      awsIotWrapper = new AWSIotService(getKeysResponse);

      await awsIotWrapper.connect();

      await awsIotWrapper.subscribe('/oauth/token');

      const path = `/auth/signin/soundcloud`;
      const signedRequest = this.awsApiGateway.prepareRequest(path);

      await authWindow.loadURL(`${CONFIG.AWS_API_URL}${path}`, {
        extraHeaders: Object.keys(signedRequest.headers).reduce(
          (prevString, headerName) => `${prevString}${headerName}: ${signedRequest.headers[headerName]}\n`,
          ''
        )
      });

      // tslint:disable-next-line: no-unnecessary-local-variable
      const tokenResponse = await awsIotWrapper.waitForMessageOrTimeOut();

      authWindow.close();

      if (tokenResponse) {
        this.logger.debug('Auth successfull');

        this.store.dispatch(setLogin(tokenResponse));
        this.sendToWebContents('login-success');
        await awsIotWrapper.disconnect();
      }
    } catch (err) {
      if (authWindow?.isClosable()) {
        authWindow.close();
      }
      if (awsIotWrapper) {
        try {
          await awsIotWrapper.disconnect();
        } catch (_e) {
          // don't handle
        }
      }

      this.store.dispatch(setLoginError('Something went wrong during login'));
      this.logger.error(err);

      throw err;
    }
  }

  private async refreshToken() {
    const {
      config: {
        auth: { refreshToken }
      },
      auth: {
        authentication: { loading }
      }
    } = this.store.getState();

    if (loading) {
      return null;
    }

    if (!refreshToken) {
      this.logger.debug('Refreshtoken not found');
      this.showAuthWindow().catch(this.logger.error);

      return null;
    }

    try {
      this.logger.debug('Starting refresh');

      const tokenResponse = await this.awsApiGateway.refresh(refreshToken, 'soundcloud');

      if (tokenResponse) {
        this.logger.debug('Auth successfull');

        this.store.dispatch(setLogin(tokenResponse));
        this.sendToWebContents('login-success');

        return {
          token: tokenResponse.access_token
        };
      }
    } catch (err) {
      this.store.dispatch(setLoginError('Something went wrong during refresh'));
      this.logger.error(err);

      this.showAuthWindow().catch(this.logger.error);
    }

    return null;
  }
}
