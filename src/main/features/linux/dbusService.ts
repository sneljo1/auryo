import { EVENTS } from '../../../shared/constants/events';
import LinuxFeature from './linuxFeature';
import { ChangeTypes, PlayerStatus } from '../../../shared/store/player';

export default class DbusService extends LinuxFeature {
  private dbus: any;
  private session: any;

  shouldRun() {
    return super.shouldRun() && !process.env.TOKEN;
  }

  register() {
    const DBus = require('dbus'); // eslint-disable-line

    this.dbus = new DBus();
    this.session = this.dbus.getBus('session');

    this.registerBindings('gnome');
    this.registerBindings('mate');
  }

  registerBindings = (desktopEnv: string) => {
    this.session.getInterface(`org.${desktopEnv}.SettingsDaemon`, `/org/${desktopEnv}/SettingsDaemon/MediaKeys`, `org.${desktopEnv}.SettingsDaemon.MediaKeys`, (err: Error, iface: any) => {
      if (!err) {
        iface.on('MediaPlayerKeyPressed', (_: any, keyName: string) => {
          switch (keyName) {
            case 'Next':
              this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT);
              break;
            case 'Previous':
              this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV);
              break;
            case 'Play':
              this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
              break;
            case 'Stop':
              this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED);
              break;
            default:
          }
        });

        iface.GrabMediaPlayerKeys(0, `org.${desktopEnv}.SettingsDaemon.MediaKeys`); // eslint-disable-line
      }
    });
  }
}
