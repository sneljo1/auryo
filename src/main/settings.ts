import { ConfigState } from "@common/store/config";
import Store = require("electron-store");
import { MockSettings } from "./mockSettings";

export const settings: Store<ConfigState> = !process.env.TOKEN ? new Store({ name: "Settings", fileExtension: "" }) : new MockSettings() as any;
