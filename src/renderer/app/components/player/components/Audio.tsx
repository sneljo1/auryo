// tslint:disable:no-empty

import * as React from 'react';
import { PlayerStatus } from '../../../../../common/store/player';

interface Props {
    autoPlay?: boolean;
    children?: React.ReactNode;
    className?: string;
    controls?: boolean;
    crossOrigin: string | null;
    id?: string;
    listenInterval?: number;
    loop?: boolean;
    muted?: boolean;
    onAbort?: (event: UIEvent) => void;
    onCanPlay?: (event: Event) => void;
    onCanPlayThrough?: (event: Event) => void;
    onEnded?: (event: Event) => void;
    onError?: (event: ErrorEvent, message: string) => void;
    onListen?: (currentTime: number, duration: number) => void;
    onLoadedMetadata?: (event: Event, duration: number) => void;
    onPause?: (event: Event) => void;
    onPlay?: (event: Event) => void;
    onSeeked?: (event: Event) => void;
    onVolumeChanged?: (event: Event) => void;
    preload?: '' | 'none' | 'metadata' | 'auto';
    src: string | null;
    style?: any;
    title?: string;
    volume?: number;
}

const defaultProps = {
    autoPlay: false,
    children: null,
    className: '',
    controls: false,
    crossOrigin: null,
    id: '',
    listenInterval: 1000,
    loop: false,
    muted: false,
    onAbort: (_event: UIEvent) => { },
    onCanPlay: (_event: Event) => { },
    onCanPlayThrough: (_event: Event) => { },
    onEnded: (_event: Event) => { },
    onError: (_event: ErrorEvent, _message: string) => { },
    onListen: (_currentTime: number, _duration: number) => { },
    onLoadedMetadata: (_event: Event, _duration: number) => { },
    onPause: (_event: Event) => { },
    onPlay: (_event: React.SyntheticEvent<HTMLAudioElement>, _duration: number) => { },
    onSeeked: (_event: Event) => { },
    onVolumeChanged: (_event: Event) => { },
    preload: 'metadata',
    style: {},
    title: '',
    volume: 1.0,
};

interface State {
    isLoading: boolean;
}

type DefaultProps = typeof defaultProps;

type AllProps = DefaultProps & Props;

class ReactAudioPlayer extends React.PureComponent<AllProps, State> {

    static readonly defaultProps: DefaultProps = defaultProps;

    readonly state: State = {
        isLoading: false
    };

    private audioEl: HTMLAudioElement | null = null;
    private listenTracker: NodeJS.Timer | null = null;

    componentDidMount() {

        const audio = this.audioEl;

        if (audio) {
            this.updateVolume(this.props.volume);

            audio.addEventListener('error', (e) => this.handleError(e));

            // When enough of the file has downloaded to start playing
            audio.addEventListener('canplay', (e) => this.props.onCanPlay(e));

            // When enough of the file has downloaded to play the entire file
            audio.addEventListener('canplaythrough', (e) => this.props.onCanPlayThrough(e));

            // When audio play starts
            audio.addEventListener('play', (e) => {
                this.setListenTrack();
                this.props.onPlay(e);
            });

            // When unloading the audio player (switching to another src)
            audio.addEventListener('abort', (e) => {
                this.clearListenTrack();
                this.props.onAbort(e);
            });

            // When the file has finished playing to the end
            audio.addEventListener('ended', (e) => {
                this.clearListenTrack();
                this.props.onEnded(e);
            });

            // When the user pauses playback
            audio.addEventListener('pause', (e) => {
                this.clearListenTrack();
                this.props.onPause(e);
            });

            // When the user drags the time indicator to a new time
            audio.addEventListener('seeked', (e) => {
                this.props.onSeeked(e);
            });

            audio.addEventListener('loadedmetadata', (e) => {
                this.props.onLoadedMetadata(e, audio.duration);
            });

            audio.addEventListener('volumechange', (e) => {
                this.props.onVolumeChanged(e);
            });
        }
    }

    componentWillUnmount() {
        if (this.audioEl) {
            this.audioEl = null;
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        this.updateVolume(nextProps.volume);
    }

    get instance(): HTMLAudioElement | null {
        return this.audioEl;
    }

    stop() {
        if (this.audioEl) {
            this.audioEl.pause();
            this.audioEl.currentTime = 0;
        }
    }
    /**
     * Set an interval to call props.onListen every props.listenInterval time period
     */
    setListenTrack() {
        if (!this.listenTracker) {
            const listenInterval = this.props.listenInterval;
            this.time();
            this.listenTracker = setInterval(() => {
                this.time();
            }, listenInterval);
        }
    }

    time() {
        if (this.audioEl) {
            this.props.onListen(this.audioEl.currentTime, this.audioEl.duration);
        }
    }

    getStatus(): PlayerStatus {
        if (this.audioEl) {
            if (this.audioEl.currentTime > 0
                && !this.audioEl.paused
                && !this.audioEl.ended
                && this.audioEl.readyState > 2) {
                return PlayerStatus.PLAYING;
            } else if (this.audioEl.paused && !this.audioEl.ended) {
                return PlayerStatus.PAUSED;
            }
        }
        return PlayerStatus.STOPPED;
    }

    setNewStatus(status: PlayerStatus) {
        const { isLoading } = this.state;
        if (this.audioEl) {
            switch (status) {
                case PlayerStatus.PLAYING:
                    if (isLoading) {
                        break;
                    }
                    this.setState({
                        isLoading: true
                    });

                    this.play();

                    break;
                case PlayerStatus.PAUSED:
                    this.audioEl.pause();
                    break;
                case PlayerStatus.STOPPED:
                    this.audioEl.currentTime = 0;
                    this.audioEl.pause();
                    break;
                default:
            }
        }
    }

    play = () => {
        if (this.audioEl) {
            this.audioEl.play()
                .then(() => {
                    this.setState({
                        isLoading: false
                    });
                })
                .catch(() => {

                    this.setState({
                        isLoading: false
                    });

                    this.clearListenTrack();
                });
        }

    }

    /**
     * Set the volume on the audio element from props
     * @param {Number} volume
     */
    updateVolume(volume: number) {
        if (typeof volume === 'number' && this.audioEl && volume !== this.audioEl.volume) {
            this.audioEl.volume = volume;
        }
    }

    /**
     * Clear the onListen interval
     */
    clearListenTrack() {
        if (this.listenTracker) {
            clearInterval(this.listenTracker);
            this.listenTracker = null;
        }
    }

    clearTime = () => {
        if (this.audioEl) {
            this.audioEl.currentTime = 0;
        }
    }

    render() {

        return (
            <audio
                className={`react-audio-player ${this.props.className}`}
                id={this.props.id}
                loop={this.props.loop}
                muted={this.props.muted}
                preload={this.props.preload}
                ref={(ref) => this.audioEl = ref}
                src={this.props.src || ''}
                style={this.props.style}

            />
        );
    }

    private handleError = (e: any) => {
        console.log('handleerror', e);
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_NETWORK:
                setTimeout(() => {
                    console.log('retry-ing');
                    if (this.audioEl) {
                        const fromTime = this.audioEl.currentTime;
                        this.audioEl.load();
                        this.audioEl.currentTime = fromTime;
                        this.play();
                    }
                }, 3000);
                break;
            case e.target.error.MEDIA_ERR_DECODE:
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            default:
                this.props.onError(e, 'An error occurred during playback.');
                break;
        }
    }
}

export default ReactAudioPlayer;
