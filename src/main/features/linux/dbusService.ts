import { changeTrack, ChangeTypes, PlayerStatus, toggleStatus } from "@common/store/player";
import * as dbus from "dbus-next";
import { Logger, LoggerInstance } from "../../utils/logger";
import LinuxFeature from "./linuxFeature";

export default class DbusService extends LinuxFeature {
	private readonly logger: LoggerInstance = Logger.createLogger(DbusService.name);

	public async register() {
		try {
			dbus.setBigIntCompat(true);

			const session = dbus.sessionBus();

			try {
				await this.registerBindings("gnome", session);
			} catch (err) {
				// ignore
			}

			try {
				await this.registerBindings("mate", session);
			} catch (err) {
				// ignore
			}
		} catch (e) {
			this.logger.error(e);
		}
	}

	public async registerBindings(desktopEnv: string, session: any) {
		try {
			const obj = await session.getProxyObject(
				`org.${desktopEnv}.SettingsDaemon`,
				`/org/${desktopEnv}/SettingsDaemon/MediaKeys`
			);

			const player = obj.getInterface(`org.${desktopEnv}.SettingsDaemon.MediaKeys`);

			player.on("MediaPlayerKeyPressed", (_: number, keyName: string) => {
				switch (keyName) {
					case "Next":
						this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any);

						return;
					case "Previous":
						this.store.dispatch(changeTrack(ChangeTypes.PREV) as any);

						return;
					case "Play":
						this.store.dispatch(toggleStatus() as any);

						return;
					case "Stop":
						this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any);

						return;
					default:
						return;
				}
			});

			player.GrabMediaPlayerKeys(0, `org.${desktopEnv}.SettingsDaemon.MediaKeys`);
		} catch (err) {
			throw err;
		}
	}
}
