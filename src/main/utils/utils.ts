import { screen } from 'electron';
import { ProxyConfig } from '../../common/store/config';

export class Utils {
  static getProxyUrlFromConfig(proxy: ProxyConfig) {
    return `https://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${proxy.port || 443}`;
  }

  static posCenter(options: { width?: number; height?: number; x?: number; y?: number }) {
    const displays = screen.getAllDisplays();

    if (displays.length > 1 && options.width && options.height) {
      const x = (displays[0].workArea.width - options.width) / 2;
      const y = (displays[0].workArea.height - options.height) / 2;
      options.x = x + displays[0].workArea.x;
      options.y = y + displays[0].workArea.y;
    }

    return options;
  }

  static async installExtensions() {
    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

    await installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], true);
  }
}
