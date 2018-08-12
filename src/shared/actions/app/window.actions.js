import { ipcRenderer } from 'electron'
import is from 'electron-is'
import React from 'react'
import { toastr } from 'react-redux-toastr'
import * as actionTypes from '../../constants/actionTypes'
import { SC } from '../../utils'
import fetchToJson from '../../api/helpers/fetchToJson'
import { isOnline } from './offline.actions'
import { toggleLike } from '../track/like.actions'
import { changeTrack, toggleStatus } from '../../../renderer/modules/player/player.actions'
import moment from 'moment'
import { push, replace } from 'react-router-redux'
import { PLAYER_STATUS, VOLUME_TYPES } from '../../../renderer/modules/player/constants/player'
import { setConfigKey } from '../config.actions'
import { EVENTS } from '../../constants/events'

import { windowRouter } from '../../utils/router'
import { toggleRepost } from '../track/reposts.actions'

export function openExternal(url) {
    ipcRenderer.send('open_external', url)
}

export function writeToClipboard(content) {
    ipcRenderer.send('write_clipboard', content)
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
                handler: (newStatus) => {

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
                handler: (event, data) => {

                    const { config: { app: { analytics } } } = getState()

                    if (process.env.NODE_ENV === 'production' && analytics) {
                        const ua = require('../../../shared/utils/universalAnalytics')
                        ua().event('SoundCloud', 'Play').send()
                    }
                }
            })

            listeners.push({
                event: 'new-version',
                handler: (data) => {
                    // TODO show modal
                    toastr.success('Auryo has updated to version ' + data, {
                        component: (
                            <div className='notification-children'>
                                <a href={'https://github.com/Superjo149/auryo/releases/tag/v' + data}
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
                    switch (data) {
                        case -1:
                            const { app: { offline } } = getState()

                            if (!offline) {
                                dispatch(isOnline())
                            }

                            break
                        case 404:
                            toastr.error('Not found!', 'This track might not exists anymore')
                            break
                        case 429:


                            const { config: { app: { analytics } } } = getState()

                            fetchToJson(url)
                                .then((json) => {
                                    if (json.errors.length > 0) {
                                        const error = json.errors[0]

                                        if (error.meta['rate_limit']) {

                                            toastr.error('Stream limit reached!', 'Unfortunately the API enforces a 15K plays/hour limit. this limit will expire in ' + moment(error.meta.reset_time).toNow())

                                            if (process.env.NODE_ENV === 'production' && analytics) {
                                                const ua = require('../../../shared/utils/universalAnalytics')
                                                ua().event('SoundCloud', 'Rate limit reached').send()
                                            }


                                        }

                                    }
                                })
                            break
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

                    toastr.success('Update available v' + data.version, 'Current version: ' + data.current_version, options)

                }
            })

            listeners.forEach(l => {
                windowRouter.on(l.event, l.handler)
            })
        }
    }
}

export function stopWatchers() {
    return dispatch => {
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


export function resolveUrl(url, dispatch) {
    if (is.renderer()) {
        fetchToJson(SC.resolveUrl(url))
            .then(json => {
                switch (json.kind) {
                    case 'track':
                        dispatch(replace('/track/' + json.id))
                        return
                    case 'user':
                        dispatch(replace('/user/' + json.id))
                        return
                    default:
                        throw Error('Not implemented')
                }
            })
            .catch(err => {
                const browserHistory = require('react-router').browserHistory

                browserHistory.goBack()

                ipcRenderer.send('open_external', unescape(url))
            })

    }
}