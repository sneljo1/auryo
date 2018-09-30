import cn from 'classnames';
import { IpcMessageEvent, ipcRenderer } from 'electron';
import isEqual from 'lodash/isEqual';
import { denormalize } from 'normalizr';
import Slider from 'rc-slider';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { IMAGE_SIZES } from '../../../shared/constants';
import { EVENTS } from '../../../shared/constants/events';
import { trackSchema } from '../../../shared/schemas';
import { StoreState } from '../../../shared/store';
import { AppState } from '../../../shared/store/app';
import { ConfigState, setConfigKey } from '../../../shared/store/config';
import { EntitiesState } from '../../../shared/store/objects';
import { changeTrack, ChangeTypes, PlayerState, PlayerStatus, RepeatTypes, setCurrentTime, setDuration, toggleStatus, updateTime } from '../../../shared/store/player';
import { addToast, toggleQueue } from '../../../shared/store/ui';
import { getReadableTime, SC } from '../../../shared/utils';
import FallbackImage from '../_shared/FallbackImage';
import TextShortener from '../_shared/TextShortener';
import Audio from './components/Audio';

interface PropsFromState {
    player: PlayerState;
    config: ConfigState;
    entities: EntitiesState;
    app: AppState;
}

interface PropsFromDispatch {
    updateTime: typeof updateTime;
    changeTrack: typeof changeTrack;
    toggleStatus: typeof toggleStatus;
    setConfigKey: typeof setConfigKey;
    setCurrentTime: typeof setCurrentTime;
    addToast: typeof addToast;
    setDuration: typeof setDuration;
    toggleQueue: typeof toggleQueue;
}

interface State {
    nextTime: number;
    isSeeking: boolean;
    isVolumeSeeking: boolean;
    muted: boolean;
    offline: boolean;
}

type AllProps = PropsFromState & PropsFromDispatch;

class Player extends React.Component<AllProps, State>{

    state: State = {
        nextTime: 0,
        isSeeking: false,
        isVolumeSeeking: false,
        muted: false,
        offline: false
    };

    private audio: Audio | null;

    componentDidMount() {
        const {
            updateTime
        } = this.props;

        const { isSeeking } = this.state;

        let stopSeeking: any;

        ipcRenderer.on(EVENTS.PLAYER.SEEK, (_event: IpcMessageEvent, to: number) => {
            if (!isSeeking) {
                this.setState({
                    isSeeking: true
                });
            }
            clearTimeout(stopSeeking);

            this.setState({
                nextTime: to
            });

            stopSeeking = setTimeout(() => {
                updateTime(to);
                this.setState({
                    isSeeking: false
                });
            }, 100);
        });
    }

    shouldComponentUpdate(nextProps: AllProps, nextState: State) {
        const { player, config } = this.props;

        return !isEqual(nextState, this.state) ||
            !isEqual(nextProps.player.playingTrack, player.playingTrack) ||
            !isEqual(nextProps.player.currentTime, player.currentTime) ||
            !isEqual(nextProps.player.status, player.status) ||
            !isEqual(nextProps.config.repeat, config.repeat) ||
            !isEqual(nextProps.config.volume, config.volume);
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners(EVENTS.PLAYER.SEEK);
    }

    changeSong = (changeType: ChangeTypes) => {
        const { changeTrack } = this.props;

        changeTrack(changeType);
    }

    toggleShuffle = () => {
        // TODO implement, same as repeat

    }

    toggleRepeat = () => {
        const { setConfigKey, config: { repeat } } = this.props;

        let newRepeatType: RepeatTypes | null = null;

        if (!repeat) {
            newRepeatType = RepeatTypes.ALL;
        } else if (repeat === RepeatTypes.ALL) {
            newRepeatType = RepeatTypes.ONE;
        }

        setConfigKey('repeat', newRepeatType);
    }

    toggleMute = () => {
        const { muted } = this.state;
        const { config } = this.props;

        const new_muted_state = !muted;

        if (!new_muted_state && config.volume === 0) {
            this.volumeChange(.5);
        } else {
            this.volumeChange(0);
        }

        this.setState({
            muted: new_muted_state
        });
    }

    // RENDER

    renderProgressBar() {
        const {
            updateTime,
            player: {
                currentTime,
                duration
            }
        } = this.props;

        const {
            isSeeking, nextTime
        } = this.state;

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
                    });
                }}
                onAfterChange={(val) => {
                    updateTime(val);

                    this.setState({
                        isSeeking: false,
                        nextTime: -1
                    });
                }}
            />
        );
    }


    seekChange = (val: number) => {
        const { setCurrentTime } = this.props;

        // TODO perhaps debounce this

        setCurrentTime(val);

        this.setState({
            nextTime: val
        });
    }

    volumeChange = (value: number) => {
        const { setConfigKey } = this.props;

        setConfigKey('volume', value);
    }

    // PLAYER LISTENERS

    onLoad = (duration: number) => {
        const {
            setDuration
        } = this.props;

        setDuration(duration);
    }

    onPlaying = (position: number) => {
        const {
            player: {
                status
            },
            setCurrentTime
        } = this.props;

        const { isSeeking } = this.state;

        if (isSeeking) return;

        if (status === PlayerStatus.PLAYING) {
            setCurrentTime(position);
        }
    }

    onFinishedPlaying = () => {
        const { changeTrack } = this.props;

        changeTrack(ChangeTypes.NEXT);
    }

    render() {

        const {
            player,
            entities,
            app,
            toggleQueue,
            addToast,
            updateTime,
            config: { volume, repeat },
            toggleStatus
        } = this.props;

        const { muted, nextTime, isVolumeSeeking } = this.state;

        const {
            status,
            currentTime,
            playingTrack,
            duration
        } = player;

        if (!playingTrack || (playingTrack && !playingTrack.id)) return null;

        const trackId = playingTrack.id;

        const track = denormalize(trackId, trackSchema, entities);

        /**
         * If Track ID is empty, just exit here
         */
        if (!track || (track && track.loading)) return null;

        if ((track.loading && !track.title) || !track.user) return <div>Loading</div>;

        const overlay_image = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

        const toggle_play_icon = status === PlayerStatus.PLAYING ? 'pause' : 'play_arrow';

        let volume_icon = 'volume_up';

        if (muted || volume === 0) {
            volume_icon = 'volume_off';
        } else if (volume !== 1) {
            volume_icon = 'volume_down';
        }

        const url = `/tracks/${track.id}`;

        return (
            <div className='player'>
                <div className='imgOverlay'>
                    <FallbackImage overflow={true} offline={app.offline} track_id={track.id} src={overlay_image} />
                </div>

                <Audio
                    ref={(ref) => this.audio = ref}
                    url={url}
                    playStatus={status}
                    volume={volume}
                    playFromPosition={nextTime}
                    muted={muted}
                    // TODO change back to un
                    id={`${''}-${playingTrack.id}`}
                    onLoading={this.onLoad}
                    onPlaying={this.onPlaying}
                    onFinishedPlaying={this.onFinishedPlaying}
                    onTimeUpdate={() => {
                        updateTime(-1);
                    }}
                    addToast={addToast}
                />

                <div className='d-flex playerInner'>
                    <div className='playerAlbum'>
                        <FallbackImage offline={app.offline}
                            track_id={track.id}
                            src={overlay_image} />
                    </div>
                    <div className='trackInfo'>
                        <div className='trackTitle' title={track.title}>
                            <Link to={`/track/${track.id}`}>
                                <TextShortener text={track.title} />
                            </Link>
                        </div>
                        <div className='trackArtist'>
                            <Link to={`/user/${track.user.id}`}>
                                <TextShortener text={track.user.username} />
                            </Link>
                        </div>
                    </div>

                    <div className='d-flex flex-xs-middle playerControls'>
                        <a href='javascript:void(0)'
                            onClick={() => {
                                this.changeSong(ChangeTypes.PREV);
                            }}>
                            <i className='icon-skip_previous' />
                        </a>
                        <a href='javascript:void(0)' onClick={() => {
                            toggleStatus()
                        }}>
                            <i className={`icon-${toggle_play_icon}`} />
                        </a>
                        <a href='javascript:void(0)' onClick={() => {
                            this.changeSong(ChangeTypes.NEXT);
                        }}>
                            <i className='icon-skip_next' />
                        </a>
                    </div>

                    <div className='action-group pr-4'>
                        <a href='javascript:void(0)'
                            className={cn({ active: repeat !== null })}
                            onClick={this.toggleRepeat}>
                            <i className={repeat === RepeatTypes.ONE ? 'icon-repeat_one' : 'icon-repeat'} />
                        </a>
                    </div>

                    <div style={{ flexGrow: 1 }}>
                        <div className='playerTimeLine'>
                            <div className='d-flex align-items-center progressWrapper'>
                                <div className='time'> {getReadableTime(currentTime, true, true)} </div>
                                <div className='progressInner'>
                                    <div className='playerProgress'>{this.renderProgressBar()} </div>
                                </div>
                                <div className='time'> {getReadableTime(duration, true, true)} </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn('playerVolume px-2', { hover: isVolumeSeeking })}>
                        <a href='javascript:void(0)' onClick={this.toggleMute}>
                            <i className={`icon-${volume_icon}`} />
                        </a>

                        <div className='progressWrapper'>
                            <Slider
                                min={0}
                                max={1}
                                value={volume}
                                step={0.05}
                                vertical={true}
                                onChange={this.volumeChange}
                                onBeforeChange={() => {
                                    this.setState({
                                        isVolumeSeeking: true
                                    });
                                }}
                                onAfterChange={() => {
                                    this.setState({
                                        isVolumeSeeking: false
                                    });
                                }}
                            />
                        </div>

                    </div>

                    <div className='action-group'>
                        <a id='toggleQueueButton'
                            href='javascript:void(0)'
                            onClick={toggleQueue.bind(this, null)}>
                            <i className='icon-playlist_play' />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { entities, player, app, config } = state;

    return {
        player,
        config,
        entities,
        app
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    updateTime,
    changeTrack,
    toggleStatus,
    setConfigKey,
    setCurrentTime,
    addToast,
    setDuration,
    toggleQueue,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
