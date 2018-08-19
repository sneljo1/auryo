import { findIndex } from "lodash";
import { actionTypes, PLAYER_STATUS } from "../constants";
import { onSuccess } from "../utils/reduxUtils";

const initialState = {
    status: PLAYER_STATUS.STOPPED,
    queue: [],
    playingTrack: {
        id: null,
        playlistId: null
    },
    currentPlaylistId: null,
    currentIndex: 0,
    currentTime: 0,
    updateTime: -1,
    duration: 0,
    upNext: {
        start: null,
        length: null
    },
    playlist_pos: []
};

export default function player(state = initialState, action) {
    const { payload, type } = action;

    switch (type) {
        case actionTypes.PLAYER_SET_TRACK:
            const position = findIndex(state.queue, payload.next_track) // eslint-disable-line

            let new_state = { // eslint-disable-line
                ...state,
                playingTrack: payload.next_track,
                status: payload.status,
                currentTime: 0,
                updateTime: -1,
                duration: 0,
                currentIndex: payload.position
            };

            if (position === state.upNext.start) {
                new_state.upNext = {
                    start: state.upNext.length >= 1 ? state.upNext.start + 1 : null,
                    length: state.upNext.length >= 1 ? state.upNext.length - 1 : null
                };
            }
            return new_state;
        case actionTypes.PLAYER_SET_TIME:
            return {
                ...state,
                currentTime: payload.time,
            };
        case actionTypes.PLAYER_UPDATE_TIME:
            return {
                ...state,
                currentTime: payload.time >= 0 && payload.time < state.duration ? payload.time : state.currentTime,
                updateTime: payload.time,
            };
        case actionTypes.PLAYER_SET_DURATION:
            return {
                ...state,
                duration: payload.time,
            };
        case actionTypes.PLAYER_TOGGLE_PLAYING:
            if (payload.status === PLAYER_STATUS.STOPPED) {
                return {
                    ...state,
                    status: payload.status,
                    playingTrack: null,
                    currentTime: 0,
                    duration: 0,
                    currentPlaylistId: null
                };
            }
            return {
                ...state,
                status: payload.status,
            };
        case onSuccess(actionTypes.PLAYER_SET_PLAYLIST):
        case actionTypes.PLAYER_SET_PLAYLIST:

            const next_pos = findIndex(payload.items, payload.next_track) // eslint-disable-line

            if (next_pos !== -1 && state.upNext.length > 0) {

                return {
                    ...state,
                    currentPlaylistId: payload.playlistId,
                    queue: [
                        ...payload.items.slice(0, next_pos + 1),
                        ...state.queue.slice(state.upNext.start, state.upNext.start + state.upNext.length),
                        ...payload.items.slice(next_pos + 1),
                    ],
                    upNext: {
                        ...state.upNext,
                        start: next_pos + 1
                    }
                };
            }
            return {
                ...state,
                currentPlaylistId: payload.playlistId,
                queue: payload.items,
                playlist_pos: payload.playlist_pos
            };
        case onSuccess(actionTypes.PLAYER_QUEUE_INSERT):
        case actionTypes.PLAYER_QUEUE_INSERT:
            return {
                ...state,
                queue: [
                    ...state.queue.slice(0, payload.index),
                    ...payload.items,
                    ...state.queue.slice(payload.index + 1),
                ]
            };
        case actionTypes.PLAYER_ADD_UP_NEXT:

            if (payload.remove !== null) {
                let new_state = { // eslint-disable-line
                    ...state,
                    queue: [
                        ...state.queue.slice(0, payload.remove),
                        ...state.queue.slice(payload.remove + 1)
                    ],
                    upNext: {
                        start: payload.remove < state.upNext.start ? state.upNext.start - 1 : state.upNext.start,
                        length: (payload.remove > state.upNext.start && payload.remove < (state.upNext.start + state.upNext.length)) ? state.upNext.length - 1 : state.upNext.length
                    }
                };

                if (payload.remove === new_state.upNext.start) {
                    new_state.upNext.length = new_state.upNext.length >= 1 ? new_state.upNext.length - 1 : null
                }

                return new_state;
            }
            if (state.upNext.length !== null) {
                return {
                    ...state,
                    queue: [
                        ...state.queue.slice(0, state.upNext.start + state.upNext.length),
                        ...payload.next,
                        ...state.queue.slice(state.upNext.start + state.upNext.length),
                    ],
                    upNext: {
                        start: state.upNext.start,
                        length: state.upNext.length + payload.next.length
                    }
                };
            }

            return {
                ...state,
                queue: [
                    ...state.queue.slice(0, payload.position + 1),
                    ...payload.next,
                    ...state.queue.slice(payload.position + 1),
                ],
                upNext: {
                    start: payload.position + 1,
                    length: state.upNext.length + payload.next.length
                }

            };

        case actionTypes.APP_RESET_STORE:
            return initialState
        default:
            return state
    }
}
