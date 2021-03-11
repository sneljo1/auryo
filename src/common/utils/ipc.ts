// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { EVENTS } from '../constants/events';

export class IPC {
  static downloadFile(url: string) {
    ipcRenderer.send(EVENTS.APP.DOWNLOAD_FILE, url);
  }
}
