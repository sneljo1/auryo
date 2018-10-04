import { findIndex } from 'lodash';
import { Reducer } from 'redux';
import { onSuccess } from '../../utils/reduxUtils';
import { PlayerState, PlayerStatus, PlayerActionTypes } from './types';
import { AppActionTypes } from '../app';
import _ from 'lodash';

const initialState = {
    status: PlayerStatus.STOPPED,
    queue: [],
    playingTrack: null,
    currentPlaylistId: null,
    currentIndex: 0,
    currentTime: 0,
    updateTime: -1,
    duration: 0,
    upNext: {
        start: 0,
        length: 0
    },
    containsPlaylists: []
};

export const playerReducer: Reducer<PlayerState> = (state = initialState, action) => {
    const { payload, type } = action;

    switch (type) {
        case PlayerActionTypes.SET_TRACK:
            const position = findIndex(state.queue, payload.nextTrack); // eslint-disable-line

            const new_state = { // eslint-disable-line
                ...state,
                playingTrack: payload.nextTrack,
                status: payload.status,
                currentTime: 0,
                updateTime: -1,
                duration: 0,
                currentIndex: payload.position
            };

            if (position === state.upNext.start) {
                new_state.upNext = {
                    start: state.upNext.length >= 1 ? state.upNext.start + 1 : 0,
                    length: state.upNext.length >= 1 ? state.upNext.length - 1 : 0
                };
            }
            return new_state;
        case PlayerActionTypes.SET_TIME:
            return {
                ...state,
                currentTime: payload.time,
            };
        case PlayerActionTypes.UPDATE_TIME:
            return {
                ...state,
                currentTime: payload.time >= 0 && payload.time < state.duration ? payload.time : state.currentTime,
                updateTime: payload.time,
            };
        case PlayerActionTypes.SET_DURATION:
            return {
                ...state,
                duration: payload.time,
            };
        case PlayerActionTypes.TOGGLE_PLAYING:
            if (payload.status === PlayerStatus.STOPPED) {
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
        case onSuccess(PlayerActionTypes.SET_PLAYLIST):
        case PlayerActionTypes.SET_PLAYLIST:

            const nextTrackPosition = findIndex(payload.items, payload.nextTrack); // eslint-disable-line

            if (nextTrackPosition !== -1 && state.upNext.length > 0) {

                return {
                    ...state,
                    currentPlaylistId: payload.playlistId,
                    queue: [
                        ...payload.items.slice(0, nextTrackPosition + 1),
                        ...state.queue.slice(state.upNext.start, state.upNext.start + state.upNext.length),
                        ...payload.items.slice(nextTrackPosition + 1),
                    ],
                    upNext: {
                        ...state.upNext,
                        start: nextTrackPosition + 1
                    }
                };
            }
            return {
                ...state,
                currentPlaylistId: payload.playlistId,
                queue: payload.items,
                containsPlaylists: payload.containsPlaylists
            };
        case onSuccess(PlayerActionTypes.QUEUE_INSERT):
        case PlayerActionTypes.QUEUE_INSERT:
            return {
                ...state,
                queue: [
                    ...state.queue.slice(0, payload.index),
                    ...payload.items,
                    ...state.queue.slice(payload.index + 1),
                ]
            };
        case PlayerActionTypes.ADD_UP_NEXT:

            if (!_.isNil(payload.remove)) {
                const newState = { // eslint-disable-line
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

                if (payload.remove === newState.upNext.start) {
                    newState.upNext.length = newState.upNext.length >= 1 ? newState.upNext.length - 1 : 0;
                }

                return newState;
            }

            if (state.upNext.length !== 0) {
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

        case AppActionTypes.RESET_STORE:
            return initialState;
        default:
            return state;
    }
};
