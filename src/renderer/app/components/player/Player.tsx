import { Intent, Popover, PopoverInteractionKind, Slider, Tag } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import { useChromeCast } from '@common/store/app';
import { hasLiked } from '@common/store/auth/selectors';
import { setConfigKey } from '@common/store/config';
import { getTrackEntity } from '@common/store/entities/selectors';
import { changeTrack, ChangeTypes,
    PlayerStatus, registerPlay, RepeatTypes, setCurrentTime, setDuration, toggleShuffle, toggleStatus } from '@common/store/player';
import { toggleLike } from '@common/store/track/actions';
import { addToast } from '@common/store/ui';
import { getReadableTime, SC } from '@common/utils';
import cn from 'classnames';
import { IpcMessageEvent, ipcRenderer } from 'electron';
import * as moment from 'moment';
import * as React from 'react';
import * as isDeepEqual from 'react-fast-compare';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import FallbackImage from '../../../_shared/FallbackImage';
import Queue from '../Queue/Queue';
import Audio from './components/Audio';
import PlayerControls from './components/PlayerControls/PlayerControls';
import TrackInfo from './components/TrackInfo/TrackInfo';
import * as styles from './Player.module.scss';
import debounce = require('lodash/debounce');

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
    nextTime: number;
    isSeeking: boolean;
    isVolumeSeeking: boolean;
    offline: boolean;
    volume: number;
}

type AllProps = PropsFromState & PropsFromDispatch;

class Player extends React.Component<AllProps, State>{

    state: State = {
        nextTime: 0,
        isSeeking: false,
        isVolumeSeeking: false,
        offline: false,
        volume: 0,
    };

    private debounceDiscover: () => void;
    private audio: Audio | null = null;

    constructor(props: AllProps) {
        super(props);
        this.debounceDiscover = debounce(() => {
            // Get Chromecast devices
            ipcRenderer.send(EVENTS.CHROMECAST.DISCOVER);
        }, 2000);
    }

    async componentDidMount() {
        try {
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
                    ipcRenderer.send(EVENTS.PLAYER.SEEK_END, to);
                }, 100);
            });

            await this.setAudioPlaybackDevice();

            // Get Chromecast devices
            ipcRenderer.send(EVENTS.CHROMECAST.DISCOVER);
        } catch (err) {
            throw err;
        }

    }

    async componentDidUpdate(prevProps: AllProps) {
        try {
            const { player: { status, duration }, playbackDeviceId } = this.props;

            if (this.audio && status !== this.audio.getStatus()) {
                this.audio.setNewStatus(status);
            }

            if (this.audio && this.audio.audio) {
                if (!isNaN(this.audio.audio.duration) && !isNaN(duration) && duration === 0 && this.audio.audio.duration !== duration) {
                    this.audio.clearTime();
                }

                if (playbackDeviceId !== prevProps.playbackDeviceId) {
                    await this.setAudioPlaybackDevice();
                }
            }
        } catch (err) {
            throw err;
        }
    }

    async setAudioPlaybackDevice() {
        const { playbackDeviceId } = this.props;

        try {

            if (playbackDeviceId && this.audio && this.audio.audio) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioDevices = devices.filter((device) => device.kind === 'audiooutput');

                const selectedAudioDevice = audioDevices.find((d) => d.deviceId === playbackDeviceId);

                if (selectedAudioDevice) {
                    await (this.audio.audio as any).setSinkId(playbackDeviceId);
                }
            }
        } catch (err) {
            throw err;
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
        const { muted, setConfigKey } = this.props;

        if (muted) {
            this.volumeChange(.5);
        } else {
            this.volumeChange(0);
        }

        setConfigKey('audio.muted', !muted);
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
                stepSize={1}
                onChange={this.seekChange}
                labelRenderer={false}
                onRelease={(val) => {
                    this.setState({
                        isSeeking: false,
                    });

                    if (this.audio && this.audio.instance) {
                        this.audio.instance.currentTime = val;
                    }

                    setCurrentTime(val);
                    ipcRenderer.send(EVENTS.PLAYER.SEEK_END, val);
                }}
            />
        );
    }


    seekChange = (nextTime: number) => {
        this.setState({
            nextTime,
            isSeeking: true
        });
    }

    volumeChange = (volume: number) => {
        if (this.props.muted) {
            this.props.setConfigKey('audio.muted', false);
        }
        this.setState({
            volume,
            isVolumeSeeking: true
        });
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
            volume: configVolume,
            repeat,
            liked,
            shuffle,
            toggleStatus,
            track,
            toggleLike,
            chromecast,
            useChromeCast,
            muted
        } = this.props;

        const { nextTime, isSeeking } = this.state;

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
                        liked={liked}
                        toggleLike={() => {
                            toggleLike(track.id);
                        }}
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

                    <Popover
                        className='mr-2'
                        popoverClassName={styles.playerPopover}
                        interactionKind={PopoverInteractionKind.HOVER}
                        hoverOpenDelay={50}
                        content={(
                            <div className={styles.playerVolume}>
                                <Slider
                                    min={0}
                                    max={1}
                                    value={volume}
                                    stepSize={0.1}
                                    vertical={true}
                                    onChange={this.volumeChange}
                                    labelRenderer={false}
                                    onRelease={(value) => {
                                        this.setState({
                                            isVolumeSeeking: false
                                        });

                                        this.props.setConfigKey('audio.volume', value);
                                    }}
                                />
                            </div>
                        )}
                    >
                        <a
                            className={styles.control}
                            href='javascript:void(0)'
                            onClick={this.toggleMute}
                        >
                            <i className={`bx bx-${volume_icon}`} />
                        </a>
                    </Popover>

                    {
                        !!chromecast.devices.length && (
                            <Popover
                                className='mr-2'

                                onOpened={this.debounceDiscover}
                                content={(
                                    <div>
                                        {
                                            chromecast.devices.map((d) => {
                                                return (
                                                    <div
                                                        key={d.id}
                                                        className='p-1'
                                                        onClick={() => {
                                                            useChromeCast(d.id);
                                                        }}
                                                    >
                                                        {d.name} {chromecast.selectedDeviceId === d.id ? '(Selected)' : null}
                                                    </div>
                                                );
                                            })
                                        }
                                        {
                                            !!chromecast.selectedDeviceId && (
                                                <div
                                                    className='p-1'
                                                    onClick={() => {
                                                        useChromeCast();
                                                    }}
                                                >
                                                    Stop casting
                                                </div>
                                            )
                                        }
                                    </div>
                                )}
                            >
                                <a
                                    className={cn(styles.control, {
                                        [styles.active]: !!chromecast.castApp
                                    })}
                                    href='javascript:void(0)'
                                >
                                    <i className='bx bx-cast' />
                                </a>
                            </Popover>
                        )
                    }

                    <Popover
                        popoverClassName={styles.playerPopover}
                        content={(
                            <Queue />
                        )}
                        position={'bottom-right'}
                    >
                        <a
                            className={styles.control}
                            href='javascript:void(0)'
                        >
                            <i className='bx bxs-playlist' />
                        </a>
                    </Popover>
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
            remainingPlays,
            overrideClientId,
            chromecast,
            muted
        } = this.props;

        const {
            status,
            playingTrack,
        } = player;

        if (!track || !playingTrack) return null;

        const volume = this.state.isVolumeSeeking ? this.state.volume : configVolume;

        const url = track.stream_url ?
            SC.appendClientId(track.stream_url, overrideClientId) :
            SC.appendClientId(`${track.uri}/stream`, overrideClientId);

        const limitReached = remainingPlays && remainingPlays.remaining === 0;

        if (remainingPlays && limitReached) {
            return (
                <div className={styles.rateLimit}>
                    Stream limit reached! Unfortunately the API enforces a 15K plays/day limit.
                    This limit will expire in <Tag className='ml-2' intent={Intent.PRIMARY}>{moment(remainingPlays.resetTime).fromNow()}</Tag>
                </div>
            );
        }

        const playingOnChromecast = !!chromecast.castApp;

        return (
            <Audio
                ref={(r) => this.audio = r}
                src={url}
                autoPlay={status === PlayerStatus.PLAYING}
                volume={volume}
                muted={muted || playingOnChromecast}
                id={`${playingTrack.id}`}
                onLoadedMetadata={this.onLoad}
                onListen={this.onPlaying}
                onEnded={this.onFinishedPlaying}
                onError={(e: ErrorEvent, message: string) => {
                    addToast({
                        message,
                        intent: Intent.DANGER
                    });
                }}
            />
        );
    }

}

const mapStateToProps = (state: StoreState) => {
    const { player, app, config } = state;

    let track = null;
    let liked = false;

    if (player.playingTrack && player.playingTrack.id) {
        track = getTrackEntity(player.playingTrack.id)(state);
        liked = hasLiked(player.playingTrack.id)(state);

        if (!track || (track && !track.title && track.loading)) {
            track = null;
        }
    }

    return {
        track,
        player,
        volume: config.audio.volume,
        muted: config.audio.muted,
        shuffle: config.shuffle,
        repeat: config.repeat,
        playbackDeviceId: config.audio.playbackDeviceId,
        overrideClientId: config.app.overrideClientId,
        remainingPlays: app.remainingPlays,
        liked,
        chromecast: app.chromecast,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    changeTrack,
    toggleStatus,
    setConfigKey,
    setCurrentTime,
    addToast,
    setDuration,
    registerPlay,
    toggleShuffle,
    toggleLike,
    useChromeCast,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Player);
