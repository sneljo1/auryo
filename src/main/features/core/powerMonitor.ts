import { PlayerStatus, toggleStatus } from "@common/store/player";
import { powerMonitor } from "electron";
import { Feature } from "../feature";

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends Feature {

  public register() {
    powerMonitor.on("suspend", this.pause);
  }

  public pause = () => {
    this.store.dispatch(toggleStatus(PlayerStatus.PAUSED) as any);
  }

  public unregister() {
    powerMonitor.removeListener("suspend", this.pause);
  }
}
