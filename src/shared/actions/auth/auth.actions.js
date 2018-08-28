/* eslint-disable global-require */
import { ipcRenderer } from 'electron';
import { replace } from 'react-router-redux';
import { setToken } from '../config.actions';
import fetchToJson from '../../api/helpers/fetchToJson';
import { actionTypes, OBJECT_TYPES, PLAYLISTS } from '../../constants';
import { SC } from '../../utils';
import { getPlaylist } from '../objectActions';
import { EVENTS } from '../../constants/events';

export * from '../track/reposts.actions';
export * from './authLikes.actions';
export * from './following.actions';

export function logout() {
    return dispatch => {
        dispatch({
            type: 'APP_RESET_STORE'
        });
        dispatch(replace('/login'));
        dispatch(setToken(null));
    };
}

export function login() {
    return dispatch => {
        ipcRenderer.send(EVENTS.APP.AUTH.LOGIN);

        ipcRenderer.once('login-success', () => {

            dispatch(replace('/'));

        });
    };
}

export function setLoginError(data) {
    return {
        type: actionTypes.AUTH_ERROR,
        payload: data
    };
}

export function setLoginLoading(loading = true) {
    return {
        type: actionTypes.AUTH_LOADING,
        payload: loading
    };
}

/**
 * Get & save auth
 *
 * @returns {function(*, *)}
 */
export function getAuth() {
    return (dispatch, getState) => {
        const { config: { app: { analytics } } } = getState();

        dispatch({
            type: actionTypes.AUTH_SET,
            payload: fetchToJson(SC.getMeUrl())
                .then(user => {
                    if (process.env.NODE_ENV === 'production' && analytics) {
                        const ua = require('../../utils/universalAnalytics');

                        ua().set('userId', user.id);
                    }
                    return user;
                })

        });
    };
}

/**
 * Get auth tracks playlist if needed
 *
 * @returns {function(*, *)}
 */
export function getAuthTracksIfNeeded() {
    return (dispatch, getState) => {
        const { objects, auth: { me } } = getState();

        if (!me || !me.id) return;

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS];
        const playlist_object = playlist_objects[PLAYLISTS.MYTRACKS];

        if (!playlist_object) {
            dispatch(getPlaylist(SC.getUserTracksUrl(me.id), PLAYLISTS.MYTRACKS));
        }
    };
}

/**
 * Get auth tracks playlist if needed
 *
 * @returns {function(*, *)}
 */
export function getAuthAllPlaylistsIfNeeded() {
    return (dispatch, getState) => {
        const { objects, auth: { me } } = getState();

        if (!me || !me.id) return;

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS];
        const playlist_object = playlist_objects[PLAYLISTS.PLAYLISTS];

        if (!playlist_object) {
            dispatch(getPlaylist(SC.getAllUserPlaylistsUrl(me.id), PLAYLISTS.PLAYLISTS));
        }
    };
}