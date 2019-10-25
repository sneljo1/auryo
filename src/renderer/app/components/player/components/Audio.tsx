// tslint:disable:no-empty

import { PlayerStatus } from "@common/store/player";
import { autobind } from "core-decorators";
import * as React from "react";

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
	preload?: "" | "none" | "metadata" | "auto";
	src: string | null;
	style?: any;
	title?: string;
	volume?: number;
	onAbort(event: UIEvent): void;
	onCanPlay(event: Event): void;
	onCanPlayThrough(event: Event): void;
	onEnded(event: Event): void;
	onError(event: ErrorEvent, message: string): void;
	onListen(currentTime: number, duration: number): void;
	onLoadedMetadata(event: Event, duration: number): void;
	onPause(event: Event): void;
	onPlay(event: Event): void;
	onSeeked(event: Event): void;
	onVolumeChanged(event: Event): void;
}

const noop = () => {};

const defaultProps = {
	autoPlay: false,
	children: null,
	className: "",
	controls: false,
	crossOrigin: null,
	id: "",
	listenInterval: 1000,
	loop: false,
	muted: false,
	onAbort: noop,
	onCanPlay: noop,
	onCanPlayThrough: noop,
	onEnded: noop,
	onError: noop,
	onListen: noop,
	onLoadedMetadata: noop,
	onPause: noop,
	onPlay: noop,
	onSeeked: noop,
	onVolumeChanged: noop,
	preload: "metadata",
	style: {},
	title: "",
	volume: 1.0
};

interface State {
	isLoading: boolean;
}

type DefaultProps = typeof defaultProps;

type AllProps = Props;

@autobind
export class ReactAudioPlayer extends React.PureComponent<AllProps, State> {
	public readonly state: State = {
		isLoading: false
	};
	private audioEl = React.createRef<HTMLAudioElement>();
	private listenTracker: any = null;
	public static readonly defaultProps: DefaultProps = defaultProps;

	public componentDidMount() {
		const {
			volume,
			onCanPlay,
			onCanPlayThrough,
			onPlay,
			onAbort,
			onSeeked,
			onEnded,
			onPause,
			onLoadedMetadata,
			onVolumeChanged
		} = this.props;

		if (this.audio) {
			this.updateVolume(volume);

			this.audio.addEventListener("error", e => {
				this.handleError(e);
			});

			// When enough of the file has downloaded to start playing
			this.audio.addEventListener("canplay", e => {
				onCanPlay(e);
			});

			// When enough of the file has downloaded to play the entire file
			this.audio.addEventListener("canplaythrough", e => {
				onCanPlayThrough(e);
			});

			// When audio play starts
			this.audio.addEventListener("play", e => {
				this.setListenTrack();
				onPlay(e);
			});

			// When unloading the audio player (switching to another src)
			this.audio.addEventListener("abort", e => {
				this.clearListenTrack();
				onAbort(e);
			});

			// When the file has finished playing to the end
			this.audio.addEventListener("ended", e => {
				this.clearListenTrack();
				onEnded(e);
			});

			// When the user pauses playback
			this.audio.addEventListener("pause", e => {
				this.clearListenTrack();
				onPause(e);
			});

			// When the user drags the time indicator to a new time
			this.audio.addEventListener("seeked", e => {
				onSeeked(e);
			});

			this.audio.addEventListener("loadedmetadata", e => {
				if (this.audio) {
					onLoadedMetadata(e, this.audio.duration);
				}
			});

			this.audio.addEventListener("volumechange", e => {
				onVolumeChanged(e);
			});
		}
	}

	public componentDidUpdate() {
		const { volume } = this.props;
		this.updateVolume(volume);
	}

	get audio() {
		return this.audioEl.current;
	}
	/**
	 * Set an interval to call props.onListen every props.listenInterval time period
	 */
	public setListenTrack() {
		if (!this.listenTracker) {
			const { listenInterval } = this.props;
			this.time();
			this.listenTracker = setInterval(() => {
				this.time();
			}, listenInterval);
		}
	}

	public getStatus(): PlayerStatus {
		if (this.audio) {
			if (this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended && this.audio.readyState > 2) {
				return PlayerStatus.PLAYING;
			}
			if (this.audio.paused && !this.audio.ended) {
				return PlayerStatus.PAUSED;
			}
		}

		return PlayerStatus.STOPPED;
	}

	public setNewStatus(status: PlayerStatus) {
		const { isLoading } = this.state;
		if (this.audio) {
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
					this.audio.pause();
					break;
				case PlayerStatus.STOPPED:
					this.audio.currentTime = 0;
					this.audio.pause();
					break;
				default:
			}
		}
	}

	public play() {
		if (this.audio) {
			this.audio
				.play()
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

	public time() {
		const { onListen } = this.props;

		if (this.audio) {
			onListen(this.audio.currentTime, this.audio.duration);
		}
	}

	public updateVolume(volume?: number) {
		if (volume && typeof volume === "number" && this.audio && volume !== this.audio.volume) {
			this.audio.volume = volume;
		}
	}

	/**
	 * Clear the onListen interval
	 */
	public clearListenTrack() {
		if (this.listenTracker) {
			clearInterval(this.listenTracker);
			this.listenTracker = null;
		}
	}

	public clearTime() {
		if (this.audio) {
			this.audio.currentTime = 0;
		}
	}

	public stop() {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
		}
	}

	private retry() {
		if (this.audio) {
			const fromTime = this.audio.currentTime;
			this.audio.load();
			this.audio.currentTime = fromTime;
			this.play();
		}
	}

	private handleError(e: any) {
		const { onError } = this.props;

		switch (e.target.error.code) {
			case e.target.error.MEDIA_ERR_NETWORK:
				this.retry();
				setTimeout(this.retry, 500);
				break;
			case e.target.error.MEDIA_ERR_DECODE:
			case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
			default:
				onError(e, "An error occurred during playback.");
		}
	}

	public render() {
		const { src, className, loop, muted, preload, style } = this.props;

		return (
			<audio
				className={`react-audio-player ${className}`}
				loop={loop}
				muted={muted}
				preload={preload}
				ref={this.audioEl}
				src={src || ""}
				style={style}
			/>
		);
	}
}
