import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { changeTrack, toggleStatus } from '@common/store/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dbus from 'dbus-next';
import { Logger, LoggerInstance } from '../../utils/logger';
import LinuxFeature from './linuxFeature';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from 'electron';

export default class DbusService extends LinuxFeature {
  public readonly featureName = 'DbusService';
  private readonly logger: LoggerInstance = Logger.createLogger(DbusService.featureName);

  public async register() {
    try {
      dbus.setBigIntCompat(true);

      const session = dbus.sessionBus();

      try {
        await this.registerBindings('gnome', session);
      } catch (err) {
        // ignore
      }

      try {
        await this.registerBindings('mate', session);
      } catch (err) {
        // ignore
      }
    } catch (e) {
      this.logger.error(e);
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
      interfaceLegacy.GrabMediaPlayerKeys('Auryo', 0); // eslint-disable-line
    });

    const future = await session.getProxyObject(
      `org.${desktopEnv}.SettingsDaemon.MediaKeys`,
      `/org/${desktopEnv}/SettingsDaemon/MediaKeys`
    );
    const interfaceFuture = future.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);
    interfaceFuture.on('MediaPlayerKeyPressed', this.onMediaPlayerKeyPressed);
    app.on('browser-window-focus', () => {
      interfaceFuture.GrabMediaPlayerKeys('Auryo', 0); // eslint-disable-line
    });
  }

  private onMediaPlayerKeyPressed(_: number, keyName: string) {
    switch (keyName) {
      case 'Next':
        this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any);
        break;
      case 'Previous':
        this.store.dispatch(changeTrack(ChangeTypes.PREV) as any);
        break;
      case 'Play':
        this.store.dispatch(toggleStatus() as any);
        break;
      case 'Stop':
        this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any);
        break;
      default:
    }
  }
}
