import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { Auryo } from '@main/app';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dbus from 'dbus-next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from 'electron';
import { Logger, LoggerInstance } from '../../utils/logger';
import LinuxFeature from './linuxFeature';

export default class DbusService extends LinuxFeature {
  public readonly featureName = 'DbusService';
  private readonly logger: LoggerInstance = Logger.createLogger(DbusService.featureName);

  constructor(auryo: Auryo) {
    super(auryo, 'focus');
  }

  public async register() {
    dbus.setBigIntCompat(true);

    const session = dbus.sessionBus();

    try {
      await Promise.all(['mate', 'gnome'].map((platform) => this.registerBindings(platform, session)));
    } catch (err) {
      this.logger.trace({ err }, 'Error registering platform');
    }
  }

  public async registerBindings(desktopEnv: string, session: any) {
    const legacy = await session.getProxyObject(
      `org.${desktopEnv}.SettingsDaemon`,
      `/org/${desktopEnv}/SettingsDaemon/MediaKeys`
    );
    const interfaceLegacy = legacy.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    interfaceLegacy.on('MediaPlayerKeyPressed', this.onMediaPlayerKeyPressed);
    app.on('browser-window-focus', () => {
      interfaceLegacy.GrabMediaPlayerKeys('Auryo', 0);
    });

    const future = await session.getProxyObject(
      `org.${desktopEnv}.SettingsDaemon.MediaKeys`,
      `/org/${desktopEnv}/SettingsDaemon/MediaKeys`
    );
    const interfaceFuture = future.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    interfaceFuture.on('MediaPlayerKeyPressed', this.onMediaPlayerKeyPressed);
    app.on('browser-window-focus', () => {
      interfaceFuture.GrabMediaPlayerKeys('Auryo', 0);
    });
  }

  private onMediaPlayerKeyPressed(_: number, keyName: string) {
    switch (keyName) {
      case 'Next':
        this.store.dispatch(changeTrack(ChangeTypes.NEXT));
        break;
      case 'Previous':
        this.store.dispatch(changeTrack(ChangeTypes.PREV));
        break;
      case 'Play':
        this.store.dispatch(toggleStatus());
        break;
      case 'Stop':
        this.store.dispatch(toggleStatus(PlayerStatus.STOPPED));
        break;
      default:
    }
  }
}
