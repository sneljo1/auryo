/* eslint-disable promise/always-return,no-underscore-dangle */

import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { toastr } from "react-redux-toastr";
import { PLAYER_STATUS } from '../../../../../shared/constants/index';

class Audio extends Component {

    constructor(props) {
        super(props)

        // html audio element used for playback
        this.player = null

        this.throttleUpdateTimeFunc = throttle(() => {
            if (this.player) {
                props.onPlaying(this.player.currentTime())
            }
        }, 500, { trailing: false })
    }

    componentDidMount() {
        const { url, playStatus } = this.props;
        this.startStream(url, playStatus)
        this._isMounted = true
    }

    componentWillReceiveProps(nextProps) {
        const { playStatus, playFromPosition, url, id, volume, onTimeUpdate, muted } = this.props

        if (playFromPosition !== nextProps.playFromPosition && nextProps.playFromPosition !== -1 && this.player) {
            this.player.seek(nextProps.playFromPosition)
            onTimeUpdate()
            console.log("1")
        }

        if (url !== nextProps.url || id !== nextProps.id) {
            this.startStream(nextProps.url, nextProps.playStatus)
            console.log("2")
        } else if (playStatus !== nextProps.playStatus) {
            this.toggleStatus(nextProps.playStatus)
            console.log("3")
        }

        if (this.player && this.player.getState() === 'playing' && !this.player.isActuallyPlaying()) {
            this.player.play()
            console.log("4")
        } else if (!this.player) {
            this.startStream(nextProps.url, nextProps.playStatus)
            console.log("5")
        }

        if (muted !== nextProps.muted && this.player) {
            this.player.setVolume(nextProps.muted ? 0 : nextProps.volume)
        } else if (volume !== nextProps.volume && this.player) {
            this.player.setVolume(nextProps.volume)
        }

    }

    componentWillUnmount() {
        this._isMounted = false
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

    startStream = (url, playStatus) => {
        const { volume } = this.props;

        if (url)
            SC.stream(url) // eslint-disable-line
                .then((player) => {
                    if (!this._isMounted) return

                    this.player = player

                    if (playStatus === PLAYER_STATUS.PLAYING && !player.isPlaying()) {
                        this.play()
                    }

                    this.setListeners()

                    this.player.setVolume(volume)
                })
                .catch((e) => {
                    console.error(e)
                })

    }

    setListeners = () => {
        const { onFinishedPlaying, onLoading } = this.props;

        if (this.player) {
            this.player.on('finish', onFinishedPlaying)
            this.player.on('play-start', () => {
                if (this.player) {
                    onLoading(this.player.getDuration())
                }
            })
            this.player.on('time', this.throttleUpdateTimeFunc)

            this.player.on('audio_error', (e) => {
                console.log("audio_error", e)
                toastr.error('Something went wrong playing this song');
            })

        }
    }

    play = () => {
        if (this.player) {
            this.player.play()
                .then(() => {
                    const { playStatus } = this.props;

                    if (playStatus === PLAYER_STATUS.PAUSED && this.player.getState() === 'playing') {
                        this.player.pause()
                    }
                })
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
    playStatus: PropTypes.string,
    volume: PropTypes.number.isRequired,
    playFromPosition: PropTypes.number.isRequired,
    muted: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,

    onLoading: PropTypes.func.isRequired,
    onPlaying: PropTypes.func.isRequired,
    onFinishedPlaying: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
}

Audio.defaultProps = {
    playStatus: PLAYER_STATUS.STOPPED
}

export default Audio