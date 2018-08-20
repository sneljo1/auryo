/* eslint-disable promise/always-return,no-underscore-dangle */

import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';
import { PLAYER_STATUS } from '../../../../../shared/constants';

class Audio extends React.Component {
    componentDidMount() {

        this._isMounted = true;

        const { url } = this.props;
        this.startStream(url)
    }

    componentWillReceiveProps(nextProps) {
        const { playStatus, playFromPosition, url, id, volume, onTimeUpdate, muted } = this.props

        if (this.player && playFromPosition !== nextProps.playFromPosition && nextProps.playFromPosition !== -1) {
            this.player.seek(nextProps.playFromPosition)
            onTimeUpdate()
        }

        if (url !== nextProps.url || id !== nextProps.id) {
            this.startStream(nextProps.url)
        }

        if (this.player && this.player.getState() === 'playing' && !this.player.isActuallyPlaying()) {
            this.startStream(nextProps.url)
        }

        if (playStatus !== nextProps.playStatus) {
            this.toggleStatus(nextProps.playStatus)
        }

        if (volume !== nextProps.volume && this.player) {
            this.player.setVolume(nextProps.volume)
        }
        if (muted !== nextProps.muted && this.player) {
            this.player.setVolume(nextProps.muted ? 0 : nextProps.volume)
        }

    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.player) {
            this.player.pause()
            this.player.kill()
        }
        this.player = null
    }

    repeat = () => {
        if (this.player) {
            this.player.pause()
            this.player.seek(0)
            this.play()
        }
    }

    startStream = (url) => {
        const { volume, playStatus } = this.props;

        if (this.player) {
            this.player.pause()
        }


        if (url) {
            // eslint-disable-next-line
            SC.stream(url)
                .then((player) => {

                    // if we don't do this, the player will initialize too soon and it won't start playing
                    if (!this._isMounted) return;

                    this.player = player

                    if (playStatus === PLAYER_STATUS.PLAYING && !this.player.isActuallyPlaying()) {
                        this.play()
                    }

                    this.setListeners()

                    this.player.setVolume(volume)
                })
                .catch((e) => {
                    console.error(e)
                })
        }
    }

    setListeners = () => {
        const { onPlaying, onFinishedPlaying, onLoading } = this.props;

        const updateTime = () => {
            onPlaying(this.player.currentTime())
        }

        const throttleUpdateTimeFunc = throttle(updateTime, 500, { trailing: false })

        if (this.player) {
            this.player.on('finish', onFinishedPlaying)
            this.player.on('play-start', () => {
                if (this.player) {
                    onLoading(this.player.getDuration())
                }
            })
            this.player.on('time', throttleUpdateTimeFunc)

            this.player.on('audio_error', (e) => {
                console.log(e)
            })

        }
    }

    play = () => {
        if (this.player) {
            this.player.play()
                .catch((e) => {
                    console.error('Playback rejected.', e)
                })
        }
    }

    toggleStatus = (value) => {

        if (!this.player) {
            return
        }

        if (!this.player.isPlaying() && value === PLAYER_STATUS.PLAYING) {
            this.play()
        } else if (this.player.isPlaying() && value === PLAYER_STATUS.PAUSED) {
            this.player.pause()
        } else if (value === PLAYER_STATUS.STOPPED) {
            this.player.pause()
            this.player.seek(0)
        }


    }

    render() {
        return null
    }

}

Audio.propTypes = {
    url: PropTypes.string.isRequired,
    playStatus: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired,
    playFromPosition: PropTypes.number.isRequired,
    muted: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,

    onLoading: PropTypes.func.isRequired,
    onPlaying: PropTypes.func.isRequired,
    onFinishedPlaying: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
}

export default Audio
