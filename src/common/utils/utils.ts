import { history } from "@renderer/configureStore";
import { SC } from ".";
import { SoundCloud } from "../../types";
import fetchToJson from "../api/helpers/fetchToJson";
import { IPC } from "./ipc";

export namespace Utils {
	export function resolveUrl(url: string) {
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
						// tslint:disable-next-line: no-console
						console.error("Resolve not implemented for", json.kind);
				}
			})
			.catch(err => {
				// tslint:disable-next-line: no-console
				console.error(err);
				history.goBack();
				IPC.openExternal(unescape(url));
			});
	}
}
