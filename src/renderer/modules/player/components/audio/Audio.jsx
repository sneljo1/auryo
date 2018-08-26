/* eslint-disable promise/always-return,no-underscore-dangle */

import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { PLAYER_STATUS } from '../../../../../shared/constants/index';

class Audio extends Component {

    constructor() {
        super()

        // html audio element used for playback
        this.player = null
    }

    componentDidMount() {
        const { url } = this.props;
        this.startStream(url)
        this._isMounted = true
    }

    componentWillReceiveProps(nextProps) {
        const { playStatus, playFromPosition, url, id, volume, onTimeUpdate, muted } = this.props

        if (playFromPosition !== nextProps.playFromPosition && nextProps.playFromPosition !== -1 && this.player) {
            this.player.seek(nextProps.playFromPosition)
            onTimeUpdate()
        }

        if (url !== nextProps.url || id !== nextProps.id) {
            this.startStream(nextProps.url)
        } else if (playStatus !== nextProps.playStatus) {
            this.toggleStatus(nextProps.playStatus)
        }

        if (this.player.getState() === 'playing' && !this.player.isActuallyPlaying()) {
            if(!this.player){
                this.startStream(nextProps.url)
            } else {
                this.player.play()
            }
        }

        if (volume !== nextProps.volume && this.player) {
            this.player.setVolume(nextProps.volume)
        }
        if (muted !== nextProps.muted && this.player) {
            this.player.setVolume(nextProps.muted ? 0 : nextProps.volume)
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

    startStream = (url) => {
        if (this.player) {
            this.player.pause()
        }

        if (url) {
            this.setState({
                loading: true
            })

            SC.stream(url)
                .then((player) => {

                    if (!this._isMounted) return

                    this.setState({
                        loading: false
                    })

                    this.player = player

                    if (this.props.playStatus === PLAYER_STATUS.PLAYING) {
                        this.play()
                    }

                    this.setListeners()

                    this.player.setVolume(this.props.volume)
                })
                .catch((e) => {
                    console.error(e)
                })
        }
    }

    setListeners = () => {
        let updateTime = () => {
            this.props.onPlaying(this.player.currentTime())
        }

        const throttleUpdateTimeFunc = throttle(updateTime, 500, { trailing: false })

        if (this.player) {
            this.player.on('finish', this.props.onFinishedPlaying)
            this.player.on('play-start', () => {
                if (this.player) {
                    this.props.onLoading(this.player.getDuration())
                }
            })
            this.player.on('time', throttleUpdateTimeFunc)

            this.player.on('audio_error', (e) => {
                console.log("audio_error",e)
            })

        }
    }

    play = () => {
        if (this.player) {
            this.player.play()
                .catch((e) => {
                    console.error('Playback rejected.', e)

                    this.play()
                })
        }
    }

    toggleStatus(value) {

        if (!this.player) {
            return
        }

        if (!this.player.isPlaying() && value === PLAYER_STATUS.PLAYING) {
            this.play(this.audio)
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

export default Audio