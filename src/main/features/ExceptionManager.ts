import unhandled from 'electron-unhandled';
import { Logger } from '../utils/logger';
import Feature from './feature';

export default class ExceptionManager extends Feature {
  private logger = new Logger('ExceptionManager');

  register() {
    this.win.webContents.on('crashed', (event: any) => {
      this.logger.error('APP CRASHED:');
      this.logger.error(event);
    });

    this.win.on('unresponsive', (event: any) => {
      this.logger.error('APP UNRESPONSIVE:');
      this.logger.error(event);
    });

    unhandled();
  }
}
