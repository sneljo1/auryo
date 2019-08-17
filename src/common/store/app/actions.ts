import { fetchRemainingTracks } from "@common/api/fetchRemainingTracks";
import { push, replace } from "connected-react-router";
import { ipcRenderer } from "electron";
import { action } from "typesafe-actions";
import { ThunkResult } from "../../../types";
import { EVENTS } from "../../constants/events";
import { SC } from "../../utils";
import { getAuth, getAuthFeed, getAuthFollowings, getAuthLikeIds, getAuthLikesIfNeeded, getAuthPlaylists, getAuthReposts } from "../auth/actions";
import { toggleLike, toggleRepost } from "../track/actions";
import { AppActionTypes, CanGoHistory, Dimensions } from "./types";

export function getRemainingPlays(): ThunkResult<void> {
	return (dispatch, getState) => {
		const {
			config: {
				app: { overrideClientId }
			}
		} = getState();

		dispatch({
			type: AppActionTypes.SET_REMAINING_PLAYS,
			payload: fetchRemainingTracks(overrideClientId)
		});
	};
}

export function initApp(): ThunkResult<void> {
	return (dispatch, getState) => {
		const {
			config: { token }
		} = getState();

		if (!token) {
			dispatch(replace("/login"));

			return;
		}

		SC.initialize(token);

		dispatch(initWatchers());

		if (process.env.NODE_ENV === "development") {
			dispatch(action(AppActionTypes.RESET_STORE));
		}

		return dispatch(
			action(
				AppActionTypes.SET_LOADED,
				Promise.all([
					dispatch(getAuth()),
					dispatch(getAuthFollowings()),
					dispatch(getAuthReposts()),

					dispatch(getAuthFeed()),
					dispatch(getAuthLikesIfNeeded()),
					dispatch(getAuthLikeIds()),
					dispatch(getAuthPlaylists()),
					dispatch(getRemainingPlays())
				]).then(() => {
					setInterval(() => dispatch(getRemainingPlays()), 30000);
				})
			)
		);
	};
}

export const setDimensions = (dimensions: Dimensions) =>
	action(AppActionTypes.SET_DIMENSIONS, dimensions);
export const canGoInHistory = (canGoHistory: CanGoHistory) =>
	action(AppActionTypes.SET_CAN_GO, canGoHistory);
export const setLastfmLoading = (loading: boolean) =>
	action(AppActionTypes.SET_LASTFM_LOADING, loading);

export const toggleOffline = (offline: boolean) =>
	action(AppActionTypes.TOGGLE_OFFLINE, {
		time: new Date().getTime(),
		offline
	});
export const setUpdateAvailable = (version: string) =>
	action(AppActionTypes.SET_UPDATE_AVAILABLE, {
		version
	});

let listeners: any[] = [];

export function initWatchers(): ThunkResult<any> {
	// tslint:disable-next-line: max-func-body-length
	return (dispatch, getState) => {
		if (!listeners.length) {
			listeners.push({
				event: EVENTS.APP.PUSH_NAVIGATION,
				handler: (_e: any, path: string, url: string) => {
					dispatch(
						push({
							pathname: path,
							search: url
						})
					);
				}
			});

			listeners.push({
				event: EVENTS.TRACK.LIKE,
				handler: (_e: any, trackId: string) => {
					if (trackId) {
						dispatch(toggleLike(+trackId, false)); // TODO determine if track or playlist
					}
				}
			});

			listeners.push({
				event: EVENTS.TRACK.REPOST,
				handler: (_e: string, trackId: string) => {
					if (trackId) {
						dispatch(toggleRepost(+trackId, false)); // TODO determine if track or playlist
					}
				}
			});

			listeners.push({
				event: EVENTS.APP.SEND_NOTIFICATION,
				handler: (
					_e: string,
					contents: { title: string; message: string; image: string }
				) => {
					const myNotification = new Notification(contents.title, {
						body: contents.message,
						icon: contents.image,
						silent: true
					});

					myNotification.onclick = () => {
						ipcRenderer.send(EVENTS.APP.RAISE);
					};
				}
			});

			listeners.forEach(l => {
				ipcRenderer.on(l.event, l.handler);
			});
		}
	};
}

export function stopWatchers(): void {
	listeners.forEach(l => {
		ipcRenderer.removeListener(l.event, l.handler);
	});

	listeners = [];
}
