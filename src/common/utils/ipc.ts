// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { EVENTS } from '../constants/events';

export class IPC {
  static openExternal(url: string) {
    ipcRenderer.send(EVENTS.APP.OPEN_EXTERNAL, url);
  }

  static writeToClipboard(content: string) {
    ipcRenderer.send(EVENTS.APP.WRITE_CLIPBOARD, content);
  }

  static downloadFile(url: string) {
    ipcRenderer.send(EVENTS.APP.DOWNLOAD_FILE, url);
  }

  static notifyTrackReposted() {
    ipcRenderer.send(EVENTS.TRACK.REPOSTED);
  }

  static notifyTrackLiked(trackId: number) {
    ipcRenderer.send(EVENTS.TRACK.LIKED, trackId);
  }
}
