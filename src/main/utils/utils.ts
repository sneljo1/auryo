// eslint-disable-next-line import/no-cycle
import { ProxyConfig } from '@common/store/config/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, screen, BrowserWindowConstructorOptions } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class Utils {
  static getProxyUrlFromConfig(proxy: ProxyConfig) {
    const port = proxy.port || 443;

    return `https://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${port}`;
  }

  static posCenter(options: BrowserWindowConstructorOptions) {
    const displays = screen.getAllDisplays();

    const browserWindowOptions = options;

    if (displays.length > 1 && options.width && options.height) {
      const x = (displays[0].workArea.width - options.width) / 2;
      const y = (displays[0].workArea.height - options.height) / 2;
      browserWindowOptions.x = x + displays[0].workArea.x;
      browserWindowOptions.y = y + displays[0].workArea.y;
    }

    return browserWindowOptions;
  }

  static getLogDir(): string {
    const userData = app.getPath('userData');
    const appName = app.name;

    const homeDir: string = os.homedir ? os.homedir() : process.env.HOME || '';

    function prepareDir(dirPath: string, ...args: string[]) {
      // tslint:disable-next-line: no-invalid-this

      if (!dirPath) {
        return null;
      }

      const fullPath: string = path.join(dirPath, ...args);

      // tslint:disable-next-line: non-literal-fs-path
      fs.mkdirSync(fullPath, { recursive: true });

      try {
        fs.accessSync(fullPath, 2);
      } catch (e) {
        return null;
      }

      return fullPath;
    }

    let dir;
    switch (process.platform) {
      case 'darwin': {
        dir =
          prepareDir(homeDir, 'Library', 'Logs', appName) ||
          prepareDir(userData) ||
          prepareDir(homeDir, 'Library', 'Application Support', appName);
        break;
      }

      case 'win32': {
        dir =
          prepareDir(userData) ||
          prepareDir(process.env.APPDATA || '', appName) ||
          prepareDir(homeDir, 'AppData', 'Roaming', appName);
        break;
      }

      default: {
        dir =
          prepareDir(userData) ||
          prepareDir(process.env.XDG_CONFIG_HOME || '', appName) ||
          prepareDir(homeDir, '.config', appName) ||
          prepareDir(process.env.XDG_DATA_HOME || '', appName) ||
          prepareDir(homeDir, '.local', 'share', appName);
      }
    }

    return dir as string;
  }
}
