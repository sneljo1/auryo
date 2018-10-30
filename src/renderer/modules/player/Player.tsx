import { Intent } from '@blueprintjs/core';
import cn from 'classnames';
import { IpcMessageEvent, ipcRenderer } from 'electron';
import { debounce, isEqual } from 'lodash';
import Slider from 'rc-slider';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { getTrackEntity } from '../../../common/store/entities/selectors';
import { SoundCloud } from '../../../types';
import { IMAGE_SIZES } from '../../../common/constants';
import { EVENTS } from '../../../common/constants/events';
import { StoreState } from '../../../common/store';
import { AppState } from '../../../common/store/app';
import { ConfigState, setConfigKey } from '../../../common/store/config';
import {
    changeTrack,
    ChangeTypes,
    PlayerState,
    PlayerStatus,
    registerPlay,
    RepeatTypes,
    setCurrentTime,
    setDuration,
    toggleStatus,
    updateTime
} from '../../../common/store/player';
import { addToast, toggleQueue } from '../../../common/store/ui';
import { getReadableTime, SC } from '../../../common/utils';
import FallbackImage from '../_shared/FallbackImage';
import TextShortener from '../_shared/TextShortener';
import Audio from './components/Audio';

interface PropsFromState {
    player: PlayerState;
    config: ConfigState;
    app: AppState;
    track: SoundCloud.Track | null;
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
    registerPlay: typeof registerPlay;
}

interface State {
    nextTime: number;
    isSeeking: boolean;
    isVolumeSeeking: boolean;
    muted: boolean;
    offline: boolean;
    volume: number;
}

type AllProps = PropsFromState & PropsFromDispatch;

class Player extends React.Component<AllProps, State>{

    private audio: Audio | null = null;
    private debouncedSetVolume: (value: number) => void;

    constructor(props: AllProps) {
        super(props);

        this.state = {
            nextTime: 0,
            isSeeking: false,
            isVolumeSeeking: false,
            muted: false,
            offline: false,
            volume: this.props.config.volume
        };

        this.debouncedSetVolume = debounce((value: number) => this.props.setConfigKey('volume', value), 100);
    }

    componentDidMount() {
        const { isSeeking } = this.state;
        const {setCurrentTime} = this.props;

        let stopSeeking: any;

        ipcRenderer.on(EVENTS.PLAYER.SEEK, (_event: IpcMessageEvent, to: number) => {
            if (!isSeeking) {
                this.setState({
                    isSeeking: true
                });
            }

            clearTimeout(stopSeeking);

            this.seekChange(to);

            stopSeeking = setTimeout(() => {
                this.setState({
                    isSeeking: false,
                });

                if (this.audio && this.audio.instance) {
                    this.audio.instance.currentTime = to;
                }

                setCurrentTime(to);
            }, 100);
        });
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { player } = this.props;

        if (this.audio && nextProps.player.playingTrack !== player.playingTrack) {
            this.audio.clearTime();
        }

        if (this.audio && nextProps.player.status !== this.audio.getStatus()) {
            this.audio.setNewStatus(nextProps.player.status);
        }
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
            player: {
                currentTime,
                duration
            },
            setCurrentTime
        } = this.props;

        const {
            isSeeking, nextTime
        } = this.state;

        return (
            <Slider
                min={0}
                max={duration}
                value={isSeeking ? nextTime : currentTime}
                step={1}
                onChange={this.seekChange}
                onBeforeChange={() => {
                    this.setState({
                        isSeeking: true
                    });
                }}
                onAfterChange={(val) => {
                    this.setState({
                        isSeeking: false,
                    });

                    if (this.audio && this.audio.instance) {
                        this.audio.instance.currentTime = val;
                    }

                    setCurrentTime(val);
                }}
            />
        );
    }


    seekChange = (nextTime: number) => {
        this.setState({
            nextTime
        });
    }

    volumeChange = (volume: number) => {
        this.setState({ volume });
        this.debouncedSetVolume(volume);

    }

    // PLAYER LISTENERS

    onLoad = (_e: Event, duration: number) => {
        const {
            setDuration,
            registerPlay
        } = this.props;

        setDuration(duration);

        registerPlay();
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
            app,
            toggleQueue,
            addToast,
            config: { volume: configVolume, repeat },
            toggleStatus,
            track
        } = this.props;

        const { muted, isVolumeSeeking, nextTime, isSeeking } = this.state;

        const {
            status,
            currentTime,
            playingTrack,
            duration
        } = player;

        /**
         * If Track ID is empty, just exit here
         */
        if (!track || !playingTrack) return null;

        if ((track.loading && !track.title) || !track.user) return <div>Loading</div>;

        const overlay_image = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

        const toggle_play_icon = status === PlayerStatus.PLAYING ? 'pause' : 'play_arrow';

        const volume = this.state.isVolumeSeeking ? this.state.volume : configVolume;

        let volume_icon = 'volume_up';

        if (muted || volume === 0) {
            volume_icon = 'volume_off';
        } else if (volume !== 1) {
            volume_icon = 'volume_down';
        }

        const url = track.stream_url ? SC.appendClientId(track.stream_url) : SC.appendClientId(`${track.uri}/stream`);

        return (
            <div className='player'>
                <div className='imgOverlay'>
                    <FallbackImage overflow={true} offline={app.offline} track_id={track.id} src={overlay_image} />
                </div>

                <Audio
                    ref={(r) => this.audio = r}
                    src={url}
                    autoPlay={status === PlayerStatus.PLAYING}
                    volume={volume}
                    muted={muted}
                    // TODO change back to un
                    id={`${''}-${playingTrack.id}`}
                    onLoadedMetadata={this.onLoad}
                    onListen={this.onPlaying}
                    onEnded={this.onFinishedPlaying}
                    onError={(e: ErrorEvent, message: string) => {
                        console.log('Player - error', e);

                        addToast({
                            message,
                            intent: Intent.DANGER
                        });
                    }}
                />

                <div className='d-flex playerInner'>
                    <div className='playerAlbum'>
                        <FallbackImage
                            offline={app.offline}
                            track_id={track.id}
                            src={overlay_image}
                        />
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
                        <a
                            href='javascript:void(0)'
                            onClick={() => {
                                this.changeSong(ChangeTypes.PREV);
                            }}
                        >
                            <i className='icon-skip_previous' />
                        </a>
                        <a
                            href='javascript:void(0)'
                            onClick={() => {
                                toggleStatus();
                            }}
                        >
                            <i className={`icon-${toggle_play_icon}`} />
                        </a>
                        <a
                            href='javascript:void(0)'
                            onClick={() => {
                                this.changeSong(ChangeTypes.NEXT);
                            }}
                        >
                            <i className='icon-skip_next' />
                        </a>
                    </div>

                    <div className='action-group pr-4'>
                        <a
                            href='javascript:void(0)'
                            className={cn({ active: repeat !== null })}
                            onClick={this.toggleRepeat}
                        >
                            <i className={repeat === RepeatTypes.ONE ? 'icon-repeat_one' : 'icon-repeat'} />
                        </a>
                    </div>

                    <div style={{ flexGrow: 1 }}>
                        <div className='playerTimeLine'>
                            <div className='d-flex align-items-center progressWrapper'>
                                <div className='time'> {getReadableTime(isSeeking ? nextTime : currentTime, false, true)} </div>
                                <div className='progressInner'>
                                    <div className='playerProgress'>{this.renderProgressBar()} </div>
                                </div>
                                <div className='time'> {getReadableTime(duration, false, true)} </div>
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
                                value={this.state.volume || volume}
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
                        <a
                            id='toggleQueueButton'
                            href='javascript:void(0)'
                            onClick={() => {
                                toggleQueue();
                            }}
                        >
                            <i className='icon-playlist_play' />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { player, app, config } = state;

    let track = null;

    if (player.playingTrack && player.playingTrack.id) {
        track = getTrackEntity(player.playingTrack.id)(state);

        if (!track || (track && track.loading)) {
            track = null;
        }
    }

    return {
        track,
        player,
        config,
        app
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({
    updateTime,
    changeTrack,
    toggleStatus,
    setConfigKey,
    setCurrentTime,
    addToast,
    setDuration,
    toggleQueue,
    registerPlay
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
