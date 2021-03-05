import { ProxyConfig } from '@common/store/config/types';
import { SoundCloud } from '@types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindowConstructorOptions, screen } from 'electron';

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

  static cleanInfo(track: SoundCloud.Track) {
    let artist = track.user && track.user.username ? track.user.username : 'Unknown artist';
    let { title } = track;

    if (track.title.match(/\s-\s|\s—\s|\s–\s/)) {
      const parts = track.title.split(/\s-\s|\s—\s|\s–\s/);
      if (parts && parts.length) {
        const shift = parts.shift();
        if (shift) {
          artist = shift.trim();
        }
        title = parts.join(' — ').trim();
      }
    }

    return {
      artist: artist.replace(/\s*\[.*?\]\s*/gi, ''),
      title: title.replace(/\s*\[.*?\]\s*/gi, '')
    };
  }
}
