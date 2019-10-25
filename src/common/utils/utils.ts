// eslint-disable-next-line import/no-cycle
import { SoundCloud } from "@types";
import { SC } from ".";
import fetchToJson from "../api/helpers/fetchToJson";
import { IPC } from "./ipc";
import is from "electron-is";

let history: any = {};

if (is.renderer()) {
	// eslint-disable-next-line
	history = require("@renderer/history");
}

export class Utils {
	static resolveUrl(url: string) {
		fetchToJson<SoundCloud.Asset<any>>(SC.resolveUrl(url))
			.then(json => {
				switch (json.kind) {
					case "track":
						return history.replace(`/track/${json.id}`);
					case "playlist":
						return history.replace(`/playlist/${json.id}`);
					case "user":
						return history.replace(`/user/${json.id}`);
					default:
						console.error("Resolve not implemented for", json.kind);
						return null;
				}
			})
			.catch(err => {
				console.error(err);
				history.goBack();
				IPC.openExternal(unescape(url));
			});
	}
}
