import { EVENTS } from "@common/constants/events";
import { ChangeTypes, PlayerStatus } from "@common/store/player";
import { globalShortcut } from "electron";
import { Auryo } from "../../app";
import { Feature } from "../feature";

/**
 * Register global media shortcuts
 */
export default class Shortcut extends Feature {
  constructor(auryo: Auryo) {
    super(auryo, "ready-to-show");
  }
  public register() {
    globalShortcut.register("MediaPlayPause", () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
    });
    globalShortcut.register("MediaPreviousTrack", () => {
      this.changeTrack(ChangeTypes.PREV);
    });
    globalShortcut.register("MediaNextTrack", () => {
      this.changeTrack(ChangeTypes.NEXT);
    });
    globalShortcut.register("MediaStop", () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED);
    });
  }

  public unregister() {
    globalShortcut.unregisterAll();
  }

  public changeTrack = (changeType: ChangeTypes) => {
    this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, changeType);
  }
}
