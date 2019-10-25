import { ChangeTypes, PlayerStatus } from "@common/store/player";
import { changeTrack, toggleStatus } from "@common/store/actions";
// eslint-disable-next-line import/no-extraneous-dependencies
import { globalShortcut } from "electron";
import * as is from "electron-is";
import { Auryo } from "../../app";
import { Feature } from "../feature";

/**
 * Register global media shortcuts
 */
export default class Shortcut extends Feature {
	constructor(auryo: Auryo) {
		super(auryo, "ready-to-show");
	}

	public shouldRun() {
		return !is.osx(); // It seems like shortcuts are caught in MediaServiceManager
	}

	public register() {
		globalShortcut.register("MediaPlayPause", () => {
			this.store.dispatch(toggleStatus() as any);
		});
		globalShortcut.register("MediaPreviousTrack", () => {
			this.store.dispatch(changeTrack(ChangeTypes.PREV) as any);
		});
		globalShortcut.register("MediaNextTrack", () => {
			this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any);
		});
		globalShortcut.register("MediaStop", () => {
			this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any);
		});
	}

	public unregister() {
		globalShortcut.unregisterAll();
	}
}
