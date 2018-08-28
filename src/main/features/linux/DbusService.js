import ILinuxFeature from './ILinuxFeature';
import { EVENTS } from '../../../shared/constants/events';
import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants';

export default class DbusService extends ILinuxFeature {

    shouldRun() {
        return super.shouldRun() && !process.env.TOKEN
    }

    register() {
        const DBus = require("dbus"); // eslint-disable-line

        this.dbus = new DBus();
        this.session = this.dbus.getBus('session');

        this.registerBindings('gnome');
        this.registerBindings('mate');

    }

    registerBindings = (desktopEnv) => {
        this.session.getInterface(`org.${desktopEnv}.SettingsDaemon`,
            `/org/${desktopEnv}/SettingsDaemon/MediaKeys`,
            `org.${desktopEnv}.SettingsDaemon.MediaKeys`, (err, iface) => {
                if (!err) {
                    iface.on('MediaPlayerKeyPressed', (n, keyName) => {
                        switch (keyName) {
                            case 'Next': this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.NEXT); break;
                            case 'Previous': this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.PREV); break;
                            case 'Play': this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS); break;
                            case 'Stop': this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.STOPPED); break;
                            default:
                        }
                    });

                    iface.GrabMediaPlayerKeys(0, `org.${desktopEnv}.SettingsDaemon.MediaKeys`); // eslint-disable-line
                }
            });
    }

}