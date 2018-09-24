import cn from 'classnames';
import { ipcRenderer } from 'electron';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import React from 'react';
import TextTruncate from 'react-dotdotdot';
import { Link } from 'react-router-dom';
import { EVENTS } from '../../../../shared/constants/events';
import { CHANGE_TYPES, IMAGE_SIZES, PLAYER_STATUS, REPEAT_TYPES } from '../../../../shared/constants/index';
import { getReadableTime, SC } from '../../../../shared/utils';
import FallbackImage from '../../_shared/FallbackImage';
import Audio from './audio/Audio';

class Player extends React.Component {

    state = {
        nextTime: 0,
        duration: 0,
        isSeeking: false,
        isVolumeSeeking: false,
        muted: false,
        offline: false
    }

    componentDidMount() {
        const {
            updateTime
        } = this.props

        const { isSeeking } = this.state;

        let stopSeeking

        ipcRenderer.on(EVENTS.PLAYER.SEEK, (event, to) => {
            if (!isSeeking) {
                this.setState({
                    isSeeking: true
                })
            }
            clearTimeout(stopSeeking)

            this.setState({
                nextTime: to
            })

            stopSeeking = setTimeout(() => {
                updateTime(to)
                this.setState({
                    isSeeking: false
                })
            }, 100)
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { player, config } = this.props;

        return !isEqual(nextState, this.state) ||
            !isEqual(nextProps.player.playingTrack.id, player.playingTrack.id) ||
            !isEqual(nextProps.player.currentTime, player.currentTime) ||
            !isEqual(nextProps.player.status, player.status) ||
            !isEqual(nextProps.config.repeat, config.repeat) ||
            !isEqual(nextProps.config.volume, config.volume)
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners([EVENTS.PLAYER.SEEK])
    }

    changeSong = (changeType) => {
        const { changeTrack } = this.props;

        changeTrack(changeType)
    }

    togglePlay = () => {
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

    toggleShuffle = () => {
        const { toggleShuffle } = this.props;

        toggleShuffle()

    }

    toggleRepeat = () => {
        const { setConfigKey, config: { repeat } } = this.props;

        let newRepeatType = null;

        if (!repeat) {
            newRepeatType = REPEAT_TYPES.ALL
        } else if (repeat === REPEAT_TYPES.ALL) {
            newRepeatType = REPEAT_TYPES.ONE
        }

        setConfigKey('repeat', newRepeatType)
    }

    toggleMute = () => {
        const { muted } = this.state;
        const { config } = this.props

        const new_muted_state = !muted

        if (!new_muted_state && config.volume === 0) {
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
        const { setCurrentTime } = this.props;

        // TODO perhaps debounce this

        setCurrentTime(val)

        this.setState({
            nextTime: val
        })
    }

    volumeChange = (value) => {
        const { setConfigKey } = this.props;

        setConfigKey('volume', value)

        this.setState({
            volume: value
        })
    }

    // PLAYER LISTENERS

    onLoad = (duration) => {
        const {
            setDuration
        } = this.props

        this.setState({
            currentTime: 0,
            duration
        })

        setDuration(duration)
    }

    onPlaying = (position) => {
        const {
            player: {
                status
            },
            setCurrentTime
        } = this.props
        const { isSeeking } = this.state;

        if (isSeeking) return

        if (status === PLAYER_STATUS.PLAYING) {

            setCurrentTime(position)

        }

    }

    onFinishedPlaying = () => {
        const { changeTrack } = this.props;

        changeTrack(CHANGE_TYPES.NEXT)
    }

    // ====

    render() {

        const {
            player,
            user_entities,
            track_entities,
            app,
            toggleQueue,
            toggleStatus,
            updateTime,
            config: { volume, repeat }
        } = this.props

        const { muted, nextTime, isVolumeSeeking, duration } = this.state

        const {
            status,
            currentTime,
            playingTrack
        } = player

        const trackID = playingTrack.id
        const track = { ...track_entities[trackID] }

        /**
         * If Track ID is empty, just exit here
         */
        if (playingTrack.id === null || !track || !trackID || (track && track.loading)) return null

        track.user = user_entities[track.user_id || track.user]

        if ((track.loading && !track.title) || !track.user) return <div>Loading</div>

        const prevFunc = this.changeSong.bind(this, CHANGE_TYPES.PREV)
        const nextFunc = this.changeSong.bind(this, CHANGE_TYPES.NEXT)

        const overlay_image = SC.getImageUrl(track, IMAGE_SIZES.XSMALL)

        const toggle_play_icon = status === PLAYER_STATUS.PLAYING ? 'pause' : 'play_arrow'

        let volume_icon = "volume_up";

        if (muted || volume === 0) {
            volume_icon = "volume_off"
        } else if (volume !== 1) {
            volume_icon = "volume_down"
        }

        const url = `/tracks/${track.id}`

        return (
            <div className="player">
                <div className="imgOverlay">
                    <FallbackImage overflow offline={app.offline} track_id={track.id} src={overlay_image} />
                </div>

                <Audio
                    ref={ref => this.audio = ref}
                    url={url}
                    playStatus={status}
                    volume={volume}
                    playFromPosition={nextTime}
                    muted={muted}
                    id={`${playingTrack.un}-${playingTrack.id}`}
                    offline={app.offline}
                    onLoading={this.onLoad}
                    onPlaying={this.onPlaying}
                    onFinishedPlaying={this.onFinishedPlaying}
                    onStatusChange={(newStatus) => {
                        toggleStatus(newStatus)
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
                            className={cn({ active: repeat !== null })}
                            onClick={this.toggleRepeat}>
                            <i className={repeat === REPEAT_TYPES.ONE ? "icon-repeat_one" : "icon-repeat"} />
                        </a>
                    </div>

                    <div style={{ flexGrow: 1 }}>
                        <div className="playerTimeLine">
                            <div className="d-flex align-items-center progressWrapper">
                                <div className="time"> {getReadableTime(currentTime, true, true)} </div>
                                <div className="progressInner">
                                    <div className="playerProgress">{this.renderProgressBar()} </div>
                                </div>
                                <div className="time"> {getReadableTime(duration, true, true)} </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn('playerVolume px-2', { hover: isVolumeSeeking })}>
                        <a href="javascript:void(0)" onClick={this.toggleMute}>
                            <i className={`icon-${volume_icon}`} />
                        </a>

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
    config: PropTypes.object.isRequired,
    track_entities: PropTypes.object.isRequired,
    user_entities: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,

    changeTrack: PropTypes.func.isRequired,
    toggleStatus: PropTypes.func.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    toggleQueue: PropTypes.func.isRequired,
    setCurrentTime: PropTypes.func.isRequired,
    setDuration: PropTypes.func.isRequired,
    toggleShuffle: PropTypes.func.isRequired,
    updateTime: PropTypes.func.isRequired
}

export default Player