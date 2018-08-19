/* eslint-disable global-require */
import { ipcRenderer } from 'electron';
import is from 'electron-is';
import moment from 'moment';
import React from 'react';
import { toastr } from 'react-redux-toastr';
import { push } from 'react-router-redux';
import fetchToJson from '../../api/helpers/fetchToJson';
import * as actionTypes from '../../constants/actionTypes';
import { EVENTS } from '../../constants/events';
import { PLAYER_STATUS, VOLUME_TYPES } from '../../constants/player';
import { SC } from '../../utils';
import { windowRouter } from '../../utils/router';
import { setConfigKey } from '../config.actions';
import { changeTrack, toggleStatus } from '../player/playerActions';
import { toggleLike } from '../track/like.actions';
import { toggleRepost } from '../track/reposts.actions';
import { isOnline } from './offline.actions';

export function openExternal(url) {
    ipcRenderer.send('open_external', url)
}

export function writeToClipboard(content) {
    ipcRenderer.send('write_clipboard', content)
}

export function downloadFile(url) {
    ipcRenderer.send('download_file', url)
}

let listeners = []

export function initWatchers() {
    return (dispatch, getState) => {

        if (!listeners.length) {
            listeners.push({
                event: 'navigate',
                handler: (data) => {
                    dispatch(push(data))
                }
            })

            listeners.push({
                event: EVENTS.PLAYER.CHANGE_TRACK,
                handler: (data) => {
                    dispatch(changeTrack(data))
                }
            })

            listeners.push({
                event: EVENTS.PLAYER.CHANGE_VOLUME,
                handler: (data) => {
                    const { config: { volume } } = getState()

                    let new_volume = volume + .05

                    if (data === VOLUME_TYPES.DOWN) {
                        new_volume = volume - .05
                    }

                    if (new_volume > 1) {
                        new_volume = 1
                    } else if (new_volume < 0) {
                        new_volume = 0
                    }

                    if (volume !== new_volume) {
                        dispatch(setConfigKey('volume', new_volume))
                    }
                }
            })

            listeners.push({
                event: EVENTS.PLAYER.TOGGLE_STATUS,
                handler: (arg) => {

                    let newStatus = arg;

                    const { player: { status } } = getState()

                    if (!newStatus) {
                        newStatus = status !== PLAYER_STATUS.PLAYING ? PLAYER_STATUS.PLAYING : PLAYER_STATUS.PAUSED
                    }
                    dispatch(toggleStatus(newStatus))
                }
            })

            listeners.push({
                event: EVENTS.TRACK.LIKE,
                handler: (trackId) => {
                    if (trackId) {
                        dispatch(toggleLike(trackId, false))
                    }
                }
            })

            listeners.push({
                event: EVENTS.TRACK.REPOST,
                handler: (trackId) => {
                    if (trackId) {
                        dispatch(toggleRepost(trackId, false))
                    }
                }
            })

            listeners.push({
                event: 'stream-request',
                handler: () => {

                    const { config: { app: { analytics } } } = getState()

                    if (process.env.NODE_ENV === 'production' && analytics) {
                        const ua = require('../../utils/universalAnalytics')
                        ua().event('SoundCloud', 'Play').send()
                    }
                }
            })

            listeners.push({
                event: 'new-version',
                handler: (data) => {
                    // TODO show modal
                    toastr.success(`Auryo has updated to version ${data}`, {
                        component: (
                            <div className='notification-children'>
                                <a href={`https://github.com/Superjo149/auryo/releases/tag/v${data}`}
                                    className='notification-action-button'>View changelog</a>
                            </div>
                        )
                    })
                }
            })

            listeners.push({
                event: 'stream-error',
                handler: (data) => {
                    console.log('stream-error')
                    const { app: { offline }, config: { app: { analytics } } } = getState()
                    switch (data) {
                        case -1:
                            if (!offline) {
                                dispatch(isOnline())
                            }
                            break
                        case 404:
                            toastr.error('Not found!', 'This track might not exists anymore')
                            break
                        case 429:
                            return fetchToJson(url)
                                .then((json) => {
                                    if (json.errors.length > 0) {
                                        const error = json.errors[0]

                                        if (error.meta.rate_limit) {

                                            toastr.error('Stream limit reached!', `Unfortunately the API enforces a 15K plays/hour limit. this limit will expire in ${moment(error.meta.reset_time).toNow()}`)

                                            if (process.env.NODE_ENV === 'production' && analytics) {
                                                const ua = require('../../utils/universalAnalytics')
                                                ua().event('SoundCloud', 'Rate limit reached').send()
                                            }
                                        }
                                    }
                                })
                        default:
                            break;
                    }
                }
            })

            listeners.push({
                event: 'update-status',
                handler: (data) => {
                    dispatch(setUpdateAvailable(data.version))

                    let options = {}

                    if (data.status === 'update-available-linux') {
                        options.component = (
                            <div className='notification-children'>
                                <a href={data.url} className='notification-action-button'>Download</a>
                            </div>
                        )
                    } else {

                        options = {
                            okText: 'Update now',
                            onOk: () => ipcRenderer.send('do-update')
                        }
                    }

                    toastr.success(`Update available v${data.version}`, `Current version: ${data.current_version}`, options)

                }
            })

            listeners.forEach(l => {
                windowRouter.on(l.event, l.handler)
            })
        }
    }
}

export function stopWatchers() {
    return () => {
        listeners.forEach(l => {
            windowRouter.removeListener(l.event, l.handler)
        })

        listeners = []
    }
}

/**
 * Set app update available
 *
 * @param version
 * @returns {{type, version: *}}
 */
function setUpdateAvailable(version) {
    return {
        type: actionTypes.APP_SET_UPDATE_AVAILABLE,
        payload: {
            version
        }
    }
}


export function resolveUrl(url, history) {
    if (is.renderer()) {
        fetchToJson(SC.resolveUrl(url))
            .then(json => {
                console.log("response", json)
                switch (json.kind) {
                    case 'track':
                        return history.replace(`/track/${json.id}`)
                    case 'user':
                        return history.replace(`/user/${json.id}`)
                    default:
                        throw Error('Not implemented')
                }
            })
            .catch(() => {
                history.goBack()
                ipcRenderer.send('open_external', unescape(url))
            })

    }
}