import { Intent } from '@blueprintjs/core';
import { throttle } from 'lodash';
import * as React from 'react';
import { PlayerStatus } from '../../../../common/store/player';
import { addToast } from '../../../../common/store/ui';

interface Props {
    url: string;
    playStatus: PlayerStatus;
    volume: number;
    playFromPosition: number;
    muted: boolean;
    id: string;

    onLoading: (curation: number) => void;
    onPlaying: (currentTime: number) => void;
    onFinishedPlaying: () => void;
    onTimeUpdate: () => void;
    addToast: typeof addToast;
}

class Audio extends React.Component<Props> {

    private throttleUpdateTimeFunc: () => void;
    private _isMounted: boolean = false;
    private player: any | null;

    constructor(props: Props) {
        super(props);

        // html audio element used for playback
        this.player = null;

        this.throttleUpdateTimeFunc = throttle(() => {
            if (this.player) {
                props.onPlaying(this.player.currentTime());
            }
        }, 500, { trailing: false });
    }

    componentDidMount() {
        const { url, playStatus } = this.props;
        this.startStream(url, playStatus);
        this._isMounted = true;
    }

    componentWillReceiveProps(nextProps: Props) {
        const { playStatus, playFromPosition, url, id, volume, onTimeUpdate, muted } = this.props;

        if (playFromPosition !== nextProps.playFromPosition && nextProps.playFromPosition !== -1 && this.player) {
            this.player.seek(nextProps.playFromPosition);
            onTimeUpdate();
        }

        if (url !== nextProps.url || id !== nextProps.id) {
            this.startStream(nextProps.url, nextProps.playStatus);
        } else if (playStatus !== nextProps.playStatus) {
            this.toggleStatus(nextProps.playStatus);
        }

        if (this.player && this.player.getState() === 'playing' && !this.player.isActuallyPlaying()) {
            this.player.play();
        } else if (!this.player) {
            this.startStream(nextProps.url, nextProps.playStatus);
        }

        if (muted !== nextProps.muted && this.player) {
            this.player.setVolume(nextProps.muted ? 0 : nextProps.volume);
        } else if (volume !== nextProps.volume && this.player) {
            this.player.setVolume(nextProps.volume);
        }

    }

    componentWillUnmount() {
        this._isMounted = false;

        if (this.player) {
            this.player.pause();
            this.player.kill();
        }

        this.player = null;
    }

    repeat = () => {
        if (this.player) {
            this.player.pause();
            this.player.seek(0);
            this.play();
        }
    }

    startStream = (url: string, playStatus: PlayerStatus) => {
        const { volume } = this.props;

        if (url) {
            (window.SC as any)
                .stream(url) // eslint-disable-line
                .then((player: any) => {

                    if (!this._isMounted) return;

                    this.player = player;

                    if (playStatus === PlayerStatus.PLAYING && !player.isPlaying()) {
                        this.play();
                    }

                    this.setListeners();

                    this.player.setVolume(volume);
                })
                .catch((error: Error) => {
                    console.error(error);
                });
        }

    }

    setListeners = () => {
        const { onFinishedPlaying, onLoading } = this.props;

        if (this.player) {
            this.player.on('finish', onFinishedPlaying);
            this.player.on('play-start', () => {
                if (this.player) {
                    onLoading(this.player.getDuration());
                }
            });
            this.player.on('time', this.throttleUpdateTimeFunc);

            this.player.on('audio_error', (error: Error) => {
                console.log('audio_error', error);

                addToast({
                    message: 'Something went wrong playing this track.',
                    intent: Intent.DANGER
                });
            });

        }
    }

    play = () => {
        if (this.player) {
            this.player.play()
                .then(() => {
                    const { playStatus } = this.props;

                    if (playStatus === PlayerStatus.PAUSED && this.player.getState() === 'playing') {
                        this.player.pause();
                    }
                })
                .catch((error: Error) => {
                    console.error('Playback rejected.', error);
                });
        }
    }


    toggleStatus = (value: PlayerStatus) => {
        if (!this.player) {
            return;
        }

        if (!this.player.isPlaying() && value === PlayerStatus.PLAYING) {
            this.play();
        } else if (this.player.isPlaying() && value === PlayerStatus.PAUSED) {
            this.player.pause();
        } else if (value === PlayerStatus.STOPPED) {
            this.player.pause();
            this.player.seek(0);
        }
    }

    render() {
        return null;
    }

}

export default Audio;
