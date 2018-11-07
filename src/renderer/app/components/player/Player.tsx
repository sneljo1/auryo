import { Intent, Tag } from '@blueprintjs/core';
import cn from 'classnames';
import { IpcMessageEvent, ipcRenderer } from 'electron';
import { debounce } from 'lodash';
import * as moment from 'moment';
import Slider from 'rc-slider';
import * as React from 'react';
import * as isDeepEqual from 'react-fast-compare';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IMAGE_SIZES } from '../../../../common/constants';
import { EVENTS } from '../../../../common/constants/events';
import { StoreState } from '../../../../common/store';
import { RemainingPlays } from '../../../../common/store/app';
import { setConfigKey } from '../../../../common/store/config';
import { getTrackEntity } from '../../../../common/store/entities/selectors';
import {
    changeTrack,
    ChangeTypes,
    PlayerState, PlayerStatus, registerPlay, RepeatTypes, setCurrentTime, setDuration, toggleShuffle, toggleStatus
} from '../../../../common/store/player';
import { addToast, toggleQueue } from '../../../../common/store/ui';
import { getReadableTime, SC } from '../../../../common/utils';
import { SoundCloud } from '../../../../types';
import Audio from './components/Audio';
import PlayerControls from './components/PlayerControls/PlayerControls';
import TrackInfo from './components/TrackInfo/TrackInfo';
import * as styles from './Player.module.scss';
import FallbackImage from '../../../_shared/FallbackImage';

interface PropsFromState {
    player: PlayerState;
    track: SoundCloud.Track | null;
    volume: number;
    remainingPlays: RemainingPlays | null;
    repeat: RepeatTypes | null;
    shuffle: boolean;
}

interface PropsFromDispatch {
    changeTrack: typeof changeTrack;
    toggleStatus: typeof toggleStatus;
    setConfigKey: typeof setConfigKey;
    setCurrentTime: typeof setCurrentTime;
    addToast: typeof addToast;
    setDuration: typeof setDuration;
    toggleQueue: typeof toggleQueue;
    registerPlay: typeof registerPlay;
    toggleShuffle: typeof toggleShuffle;
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
            volume: this.props.volume,
        };

        this.debouncedSetVolume = debounce((value: number) => this.props.setConfigKey('volume', value), 100);
    }

    componentDidMount() {
        const { isSeeking } = this.state;
        const { setCurrentTime } = this.props;

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

    componentDidUpdate(_prevProps: AllProps) {
        const { player: { status } } = this.props;

        if (this.audio && status !== this.audio.getStatus()) {
            this.audio.setNewStatus(status);
        }
    }

    shouldComponentUpdate(nextProps: AllProps, nextState: State) {
        return nextState !== this.state || !isDeepEqual(nextProps, this.props);
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners(EVENTS.PLAYER.SEEK);
    }

    changeSong = (changeType: ChangeTypes) => {
        const { changeTrack } = this.props;

        changeTrack(changeType);
    }

    toggleShuffle = () => {
        const { shuffle, toggleShuffle } = this.props;

        toggleShuffle(!shuffle);
    }

    toggleRepeat = () => {
        const { setConfigKey, repeat } = this.props;

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
        const { volume } = this.props;

        const new_muted_state = !muted;

        if (!new_muted_state && volume === 0) {
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

    onPlaying = (position: number, newDuration: number) => {
        const {
            player: {
                status,
                duration
            },
            setCurrentTime,
            setDuration
        } = this.props;

        const { isSeeking } = this.state;

        if (isSeeking) return;

        if (status === PlayerStatus.PLAYING) {
            setCurrentTime(position);
        }

        if (duration !== newDuration) {
            setDuration(newDuration);
        }


    }

    onFinishedPlaying = () => {
        const { changeTrack, toggleStatus } = this.props;

        if (this.audio) {
            this.audio.clearTime();
        }

        toggleStatus(PlayerStatus.PAUSED);

        changeTrack(ChangeTypes.NEXT, true);
    }

    render() {

        const {
            player,
            toggleQueue,
            volume: configVolume,
            repeat,
            shuffle,
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

        if (!track.title || !track.user) return <div>Loading</div>;

        const overlay_image = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

        const volume = this.state.isVolumeSeeking ? this.state.volume : configVolume;

        let volume_icon = 'volume-full';

        if (muted || volume === 0) {
            volume_icon = 'volume-mute';
        } else if (volume !== 1) {
            volume_icon = 'volume-low';
        }

        return (
            <div className={styles.player}>
                <div className={styles.player_bg}>
                    <FallbackImage
                        noPlaceholder={true}
                        src={overlay_image}
                    />
                </div>

                {this.renderAudio()}

                <div className='d-flex align-items-center'>

                    <TrackInfo
                        title={track.title}
                        id={track.id.toString()}
                        userId={track.user.id.toString()}
                        username={track.user.username}
                        img={overlay_image}
                    />

                    <PlayerControls
                        status={status}
                        repeat={repeat}
                        shuffle={shuffle}
                        onRepeatClick={this.toggleRepeat}
                        onShuffleClick={this.toggleShuffle}
                        onPreviousClick={() => {
                            this.changeSong(ChangeTypes.PREV);
                        }}
                        onNextClick={() => {
                            this.changeSong(ChangeTypes.NEXT);
                        }}
                        onToggleClick={() => {
                            toggleStatus();
                        }}
                    />

                    <div className={styles.playerTimeline}>
                        <div className={styles.time}>{getReadableTime(isSeeking ? nextTime : currentTime, false, true)}</div>
                        <div className={styles.progressInner}>
                            {this.renderProgressBar()}
                        </div>
                        <div className={styles.time}>{getReadableTime(duration, false, true)}</div>
                    </div>

                    <div className={cn('pr-2', styles.playerVolume, { hover: isVolumeSeeking })}>
                        <a
                            className={styles.control}
                            href='javascript:void(0)'
                            onClick={this.toggleMute}
                        >
                            <i className={`bx bx-${volume_icon}`} />
                        </a>

                        <div className={styles.progressWrapper}>
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

                    <a
                        className={styles.control}
                        href='javascript:void(0)'
                        onClick={() => {
                            toggleQueue();
                        }}
                    >
                        <i className='bx bxs-playlist' />
                    </a>
                </div>
            </div>
        );
    }

    renderAudio = () => {
        const {
            player,
            addToast,
            volume: configVolume,
            track,
            remainingPlays
        } = this.props;

        const { muted } = this.state;

        const {
            status,
            playingTrack,
        } = player;

        if (!track || !playingTrack) return null;

        const volume = this.state.isVolumeSeeking ? this.state.volume : configVolume;

        const url = track.stream_url ? SC.appendClientId(track.stream_url) : SC.appendClientId(`${track.uri}/stream`);

        const limitReached = remainingPlays && remainingPlays.remaining === 0;

        if (remainingPlays && limitReached) {
            return (
                <div className={styles.rateLimit}>
                    Stream limit reached! Unfortunately the API enforces a 15K plays/day limit.
                    This limit will expire in <Tag className='ml-2' intent={Intent.PRIMARY}>{moment(remainingPlays.resetTime).fromNow()}</Tag>
                </div>
            );
        }

        return (
            <Audio
                ref={(r) => this.audio = r}
                src={url}
                autoPlay={status === PlayerStatus.PLAYING}
                volume={volume}
                muted={muted}
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
        );
    }

}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { player, app, config } = state;

    let track = null;

    if (player.playingTrack && player.playingTrack.id) {
        track = getTrackEntity(player.playingTrack.id)(state);

        if (!track || (track && !track.title && track.loading)) {
            track = null;
        }
    }

    return {
        track,
        player,
        volume: config.volume,
        shuffle: config.shuffle,
        repeat: config.repeat,
        remainingPlays: app.remainingPlays
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, {}> = (dispatch) => bindActionCreators({
    changeTrack,
    toggleStatus,
    setConfigKey,
    setCurrentTime,
    addToast,
    setDuration,
    toggleQueue,
    registerPlay,
    toggleShuffle
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
