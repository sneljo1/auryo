import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { Link } from 'react-router-dom'
import { getReadableTime, SC } from '../../../../shared/utils'
import { CHANGE_TYPES, IMAGE_SIZES, PLAYER_STATUS } from '../../../../shared/constants'
import Audio from '../audio/Audio'
import FallbackImage from '../../_shared/FallbackImage'
import TextTruncate from 'react-dotdotdot'
import { ipcRenderer } from 'electron'
import Slider from 'rc-slider'
import { isEqual } from 'lodash'

class Player extends Component {

    constructor() {
        super()

        this.state = {
            nextTime: 0,
            duration: 0,
            isSeeking: false,
            isVolumeSeeking: false,
            muted: false,
            repeat: false,
            shuffle: false,
            offline: false
        }

        this.changeSong = this.changeSong.bind(this)

        this.onLoad = this.onLoad.bind(this)
        this.onPlaying = this.onPlaying.bind(this)
        this.onFinishedPlaying = this.onFinishedPlaying.bind(this)

        this.toggleMute = this.toggleMute.bind(this)
        this.togglePlay = this.togglePlay.bind(this)
        this.toggleRepeat = this.toggleRepeat.bind(this)
        this.toggleShuffle = this.toggleShuffle.bind(this)

    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !isEqual(nextState, this.state) ||
            !isEqual(nextProps.player.playingTrack.id, this.props.player.playingTrack.id) ||
            !isEqual(nextProps.player.currentTime, this.props.player.currentTime) ||
            !isEqual(nextProps.player.status, this.props.player.status) ||
            !isEqual(nextProps.config.volume, this.props.config.volume)
    }

    componentDidMount() {
        const {
            updateTime
        } = this.props
        const _this = this

        let stopSeeking

        ipcRenderer.on('seek', (event, to) => {
            if (!_this.state.isSeeking) {
                _this.setState({
                    isSeeking: true
                })
            }
            clearTimeout(stopSeeking)

            _this.setState({
                nextTime: to
            })

            stopSeeking = setTimeout(() => {
                updateTime(to)
                _this.setState({
                    isSeeking: false
                })
            }, 100)
        })
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners(['seek'])
    }

    changeSong(changeType) {
        this.props.changeTrack(changeType)
    }

    togglePlay() {
        const {
            player,
            toggleStatus
        } = this.props
        const {
            status
        } = player

        if (status !== PLAYER_STATUS.PLAYING) {
            toggleStatus(PLAYER_STATUS.PLAYING)
        } else if (status === PLAYER_STATUS.PLAYING) {
            toggleStatus(PLAYER_STATUS.PAUSED)
        }
    }

    toggleShuffle() {
        this.setState({
            shuffle: !this.state.shuffle
        })

    }

    toggleRepeat() {
        this.setState({
            repeat: !this.state.repeat
        })
    }

    toggleMute() {
        const new_muted_state = !this.state.muted

        if (!new_muted_state && this.props.config.volume === 0) {
            this.volumeChange(.5)
        } else {
            this.volumeChange(0)
        }

        this.setState({
            muted: new_muted_state
        })
    }

    // RENDER

    renderProgressBar() {
        const {
            updateTime,
            player: {
                currentTime
            }
        } = this.props
        const {
            duration, isSeeking, nextTime
        } = this.state

        return (
            <Slider
                min={0}
                max={duration}
                value={(isSeeking && nextTime !== -1) ? nextTime : currentTime}
                step={1000}
                onChange={this.seekChange}
                onBeforeChange={() => {
                    this.setState({
                        isSeeking: true
                    })
                }}
                onAfterChange={(val) => {
                    updateTime(val)

                    this.setState({
                        isSeeking: false,
                        nextTime: -1
                    })
                }}
            />
        )
    }


    seekChange = (val) => {
        // TODO perhaps debounce this

        this.props.setCurrentTime(val)

        this.setState({
            nextTime: val
        })
    }

    volumeChange = (value) => {
        this.props.setConfigKey('volume', value)

        this.setState({
            volume: value
        })
    }

    // PLAYER LISTENERS

    onLoad(duration) {
        const {
            setDuration
        } = this.props

        this.setState({
            currentTime: 0,
            duration: duration
        })

        setDuration(duration)
    }

    onPlaying(position) {
        const {
            player: {
                status
            },
            setCurrentTime
        } = this.props

        if (this.state.isSeeking) return

        if (status === PLAYER_STATUS.PLAYING) {

            setCurrentTime(position)

        }

    }

    onFinishedPlaying() {
        if (this.state.repeat) {
            this.audio.repeat()
        } else {
            this.props.changeTrack(this.state.shuffle ? CHANGE_TYPES.SHUFFLE : CHANGE_TYPES.NEXT)
        }
    }

    // ====

    render() {

        const {
            player,
            user_entities,
            track_entities,
            app,
            toggleQueue,
            updateTime,
            config: { volume },
            ui
        } = this.props
        const {
            status,
            currentTime,
            playingTrack
        } = player

        const trackID = playingTrack.id
        const track = track_entities[trackID]

        /**
         * If Track ID is empty, just exit here
         */
        if (playingTrack.id === null || !track || !trackID  || (track && track.loading)) return null

        track.user = user_entities[track.user_id || track.user]

        if ((track.loading && !track.title) || !track.user) return <div>Loading</div>


        const prevFunc = this.changeSong.bind(this, CHANGE_TYPES.PREV)
        const nextFunc = this.changeSong.bind(
            this,
            this.state.shuffle ? CHANGE_TYPES.SHUFFLE : CHANGE_TYPES.NEXT
        )

        let overlay_image = SC.getImageUrl(track, IMAGE_SIZES.XSMALL)

        const toggle_play_icon = status === PLAYER_STATUS.PLAYING ? 'pause' : 'play_arrow'
        const volume_icon = this.state.muted || this.props.config.volume === 0 ? 'volume_off' : (this.props.config.volume === 1) ? 'volume_up' : 'volume_down'

        const url = '/tracks/' + track.id

        return (
            <div className="player">
                <div className="imgOverlay">
                    <FallbackImage overflow offline={app.offline} track_id={track.id} src={overlay_image} />
                </div>

                <Audio
                    ref={ref => this.audio = ref}
                    url={url}
                    playStatus={status}
                    volume={this.props.config.volume}
                    playFromPosition={this.state.nextTime}
                    muted={this.state.muted}
                    id={playingTrack.id}
                    offline={app.offline}
                    onLoading={this.onLoad}
                    onPlaying={this.onPlaying}
                    onFinishedPlaying={this.onFinishedPlaying}
                    onStatusChange={(newStatus) => {
                        this.props.toggleStatus(newStatus)
                    }}
                    onTimeUpdate={() => {
                        updateTime(-1)
                    }}
                />

                <div className="d-flex playerInner">
                    <div className="playerAlbum">
                        <FallbackImage offline={app.offline}
                                       track_id={track.id}
                                       src={overlay_image} />
                    </div>
                    <div className="trackInfo">
                        <div className="trackTitle" title={track.title}>
                            <Link to={`/track/${track.id}`}>
                                <TextTruncate clamp={1}>
                                    {track.title}
                                </TextTruncate>
                            </Link>
                        </div>
                        <div className="trackArtist">
                            <Link to={`/user/${track.user.id}`}>
                                <TextTruncate clamp={1}>
                                    {track.user.username}
                                </TextTruncate>
                            </Link>
                        </div>
                    </div>

                    <div className="d-flex flex-xs-middle playerControls">
                        <a href="javascript:void(0)"
                           onClick={prevFunc}>
                            <i className="icon-skip_previous" />
                        </a>
                        <a href="javascript:void(0)" onClick={this.togglePlay}>
                            <i className={`icon-${toggle_play_icon}`} />
                        </a>
                        <a href="javascript:void(0)" onClick={nextFunc}>
                            <i className="icon-skip_next" />
                        </a>
                    </div>

                    <div className="action-group pr-4">
                        <a href="javascript:void(0)"
                           className={cn({ active: this.state.repeat })}
                           onClick={() => {
                               this.setState({ repeat: !this.state.repeat })
                           }}>
                            <i className="icon-repeat" />
                        </a>
                    </div>

                    <div style={{ flexGrow: 1 }}>
                        <div className="playerTimeLine">
                            <div className="d-flex align-items-center progressWrapper">
                                <div className="time"> {getReadableTime(currentTime, true, true)} </div>
                                <div className="progressInner">
                                    <div className="playerProgress" ref="seekBar"> {this.renderProgressBar()} </div>
                                </div>
                                <div className="time"> {getReadableTime(this.state.duration, true, true)} </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn('playerVolume px-2', { hover: this.state.isVolumeSeeking })}>
                        <i className={`icon-${volume_icon}`} onClick={this.toggleMute} />
                        <div className="progressWrapper">
                            <Slider
                                min={0}
                                max={1}
                                value={volume}
                                step={0.05}
                                vertical
                                onChange={this.volumeChange}
                                isVolumeSeeking={false}
                                tooltip={false}
                                onBeforeChange={() => {
                                    this.setState({
                                        isVolumeSeeking: true
                                    })
                                }}
                                onAfterChange={() => {
                                    this.setState({
                                        isVolumeSeeking: false
                                    })
                                }}
                            />
                        </div>

                    </div>

                    <div className="action-group">
                        <a id="toggleQueueButton"
                           href="javascript:void(0)"
                           onClick={toggleQueue.bind(this, null)}>
                            <i className="icon-playlist_play" />
                        </a>
                    </div>
                </div>
            </div>
        )
    }

}


Player.propTypes = {
    player: PropTypes.object.isRequired,
    playlists: PropTypes.object.isRequired,
    song: PropTypes.object,
    track_entities: PropTypes.object.isRequired,
    user_entities: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,

    changeTrack: PropTypes.func.isRequired,
    toggleStatus: PropTypes.func.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    isOnline: PropTypes.func.isRequired,
    updateTime: PropTypes.func.isRequired
}

export default Player