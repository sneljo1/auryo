import { ipcRenderer } from "electron";
import { EVENTS } from "../constants/events";

export namespace IPC {
	export function openExternal(url: string) {
		ipcRenderer.send(EVENTS.APP.OPEN_EXTERNAL, url);
	}

	export function writeToClipboard(content: string) {
		ipcRenderer.send(EVENTS.APP.WRITE_CLIPBOARD, content);
	}

	export function downloadFile(url: string) {
		ipcRenderer.send(EVENTS.APP.DOWNLOAD_FILE, url);
	}

	export function notifyTrackReposted() {
		ipcRenderer.send(EVENTS.TRACK.REPOSTED);
	}

	export function notifyTrackLiked(trackId: number) {
		ipcRenderer.send(EVENTS.TRACK.LIKED, trackId);
	}
}
