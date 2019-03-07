import { EVENTS } from '@common/constants/events';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import * as dbus from 'dbus-next';
import { Logger } from '../../utils/logger';
import LinuxFeature from './linuxFeature';


export default class DbusService extends LinuxFeature {
  private logger: Logger = new Logger('DbusService');

  async register() {
    try {
      dbus.setBigIntCompat(true);

      const session = dbus.sessionBus();

      try {
        await this.registerBindings('gnome', session);
      } catch (err) {
        this.logger.error(err);
      }
      try {
        await this.registerBindings('mate', session);
      } catch (err) {
        this.logger.error(err);
      }
    } catch (e) {
      this.logger.error(e);
    }

  }

  async registerBindings(desktopEnv: string, session: any) {
    try {
      const obj = await session.getProxyObject(`org.${desktopEnv}.SettingsDaemon`, `/org/${desktopEnv}/SettingsDaemon/MediaKeys`);

      const player = obj.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);

      player.on('MediaPlayerKeyPressed', (n: number, keyName: string) => {
        switch (keyName) {
          case 'Next': this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT); return;
          case 'Previous': this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV); return;
          case 'Play': this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS); return;
          case 'Stop': this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED); return;
          default: return;
        }
      });

      player.GrabMediaPlayerKeys(0, `org.${desktopEnv}.SettingsDaemon.MediaKeys`);

    } catch (err) {
      throw err;
    }
  }
}
