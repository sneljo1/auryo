import { EVENTS } from "@common/constants/events";
import { PlayerStatus } from "@common/store/player";
import { powerMonitor } from "electron";
import { Feature } from "../feature";

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends Feature {
  public shouldRun() {
    // ref: https://github.com/electron/electron/issues/13767
    return super.shouldRun() && !(process.platform === "linux" && process.env.SNAP_USER_DATA != null);
  }

  public register() {
    powerMonitor.on("suspend", this.pause);
  }

  public pause = () => {
    this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.PAUSED);
  }

  public unregister() {
    powerMonitor.removeListener("suspend", this.pause);
  }
}
