import { Intent, Popover, PopoverInteractionKind, Slider, Tag } from "@blueprintjs/core";
import { IMAGE_SIZES } from "@common/constants";
import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import * as actions from "@common/store/actions";
import { hasLiked } from "@common/store/auth/selectors";
import { getNormalizedTrack, getNormalizedUser } from "@common/store/entities/selectors";
import { ChangeTypes, PlayerStatus, RepeatTypes } from "@common/store/player";
import { getReadableTime, SC } from "@common/utils";
import cn from "classnames";
import { autobind } from "core-decorators";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import { debounce } from "lodash";
import moment from "moment";
import * as React from "react";
import isDeepEqual from "react-fast-compare";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import FallbackImage from "../../../_shared/FallbackImage";
import Queue from "../Queue/Queue";
import { ReactAudioPlayer } from "./components/Audio";
import PlayerControls from "./components/PlayerControls/PlayerControls";
import { TrackInfo } from "./components/TrackInfo/TrackInfo";
import * as styles from "./Player.module.scss";

const mapStateToProps = (state: StoreState) => {
	const { player, app, config } = state;

	let track = null;
	let trackUser = null;
	let liked = false;

	if (player.playingTrack && player.playingTrack.id) {
		track = getNormalizedTrack(player.playingTrack.id)(state);

		if (track) {
			trackUser = getNormalizedUser(track.user)(state);
		}

		liked = hasLiked(player.playingTrack.id)(state);

		if (!track || (track && !track.title && track.loading)) {
			track = null;
		}
	}

	return {
		track,
		trackUser,
		player,
		volume: config.audio.volume,
		muted: config.audio.muted,
		shuffle: config.shuffle,
		repeat: config.repeat,
		playbackDeviceId: config.audio.playbackDeviceId,
		overrideClientId: config.app.overrideClientId,
		remainingPlays: app.remainingPlays,
		liked,
		chromecast: app.chromecast
	};
};

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			changeTrack: actions.changeTrack,
			toggleStatus: actions.toggleStatus,
			setConfigKey: actions.setConfigKey,
			setCurrentTime: actions.setCurrentTime,
			addToast: actions.addToast,
			setDuration: actions.setDuration,
			registerPlay: actions.registerPlay,
			toggleShuffle: actions.toggleShuffle,
			toggleLike: actions.toggleLike,
			useChromeCast: actions.useChromeCast
		},
		dispatch
	);

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
	nextTime: number;
	isSeeking: boolean;
	isVolumeSeeking: boolean;
	volume: number;
}

type AllProps = PropsFromState & PropsFromDispatch;

@autobind
class Player extends React.Component<AllProps, State> {
	public state: State = {
		nextTime: 0,
		isSeeking: false,
		isVolumeSeeking: false,
		volume: 0
	};

	private readonly debounceDiscover: () => void;
	private audio = React.createRef<ReactAudioPlayer>();

	constructor(props: AllProps) {
		super(props);
		this.debounceDiscover = debounce(() => {
			// Get Chromecast devices
			ipcRenderer.send(EVENTS.CHROMECAST.DISCOVER);
		}, 2000);
	}

	public async componentDidMount() {
		const { isSeeking } = this.state;
		const { setCurrentTime } = this.props;

		let stopSeeking: any;

		ipcRenderer.on(EVENTS.PLAYER.SEEK, (_event, to: number) => {
			if (!isSeeking) {
				this.setState({
					isSeeking: true
				});
			}

			clearTimeout(stopSeeking);

			this.seekChange(to);

			stopSeeking = setTimeout(() => {
				this.setState({
					isSeeking: false
				});

				if (this.audioRef && this.audioRef.audio) {
					this.audioRef.audio.currentTime = to;
				}

				setCurrentTime(to);
				ipcRenderer.send(EVENTS.PLAYER.SEEK_END, to);
			}, 100);
		});

		await this.setAudioPlaybackDevice();

		// Get Chromecast devices
		this.debounceDiscover();
	}

	public shouldComponentUpdate(nextProps: AllProps, nextState: State) {
		return nextState !== this.state || !isDeepEqual(nextProps, this.props);
	}

	public async componentDidUpdate(prevProps: AllProps) {
		const {
			player: { status, duration },
			playbackDeviceId
		} = this.props;

		if (this.audioRef && status !== this.audioRef.getStatus()) {
			this.audioRef.setNewStatus(status);
		}

		if (this.audioRef && this.audioRef.audio) {
			if (
				!Number.isNaN(this.audioRef.audio.duration) &&
				!Number.isNaN(duration) &&
				duration === 0 &&
				this.audioRef.audio.duration !== duration
			) {
				this.audioRef.clearTime();
			}

			if (playbackDeviceId !== prevProps.playbackDeviceId) {
				await this.setAudioPlaybackDevice();
			}
		}
	}

	public componentWillUnmount() {
		ipcRenderer.removeAllListeners(EVENTS.PLAYER.SEEK);
	}

	public onLoad(_e: Event, duration: number) {
		const { setDuration, registerPlay } = this.props;

		setDuration(duration);

		registerPlay();
	}

	public onPlaying(position: number, newDuration: number) {
		const {
			player: { status, duration },
			setCurrentTime,
			setDuration
		} = this.props;

		const { isSeeking } = this.state;

		if (isSeeking) {
			return;
		}

		if (status === PlayerStatus.PLAYING) {
			setCurrentTime(position);
		}

		if (duration !== newDuration) {
			setDuration(newDuration);
		}
	}

	public onFinishedPlaying() {
		const { changeTrack, toggleStatus } = this.props;

		if (this.audioRef) {
			this.audioRef.clearTime();
		}

		toggleStatus(PlayerStatus.PAUSED);

		changeTrack(ChangeTypes.NEXT, true);
	}

	public get audioRef() {
		return this.audio.current;
	}

	public async setAudioPlaybackDevice() {
		const { playbackDeviceId } = this.props;

		if (playbackDeviceId && this.audioRef && this.audioRef.audio) {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const audioDevices = devices.filter(device => device.kind === "audiooutput");

			const selectedAudioDevice = audioDevices.find(d => d.deviceId === playbackDeviceId);

			if (selectedAudioDevice) {
				await (this.audioRef.audio as any).setSinkId(playbackDeviceId);
			}
		}
	}

	public seekChange(nextTime: number) {
		this.setState({
			nextTime,
			isSeeking: true
		});
	}

	public volumeChange(volume: number) {
		const { muted, setConfigKey } = this.props;

		if (muted) {
			setConfigKey("audio.muted", false);
		}
		this.setState({
			volume,
			isVolumeSeeking: true
		});
	}

	public toggleRepeat() {
		const { setConfigKey, repeat } = this.props;

		let newRepeatType: RepeatTypes | null = null;

		if (!repeat) {
			newRepeatType = RepeatTypes.ALL;
		} else if (repeat === RepeatTypes.ALL) {
			newRepeatType = RepeatTypes.ONE;
		}

		setConfigKey("repeat", newRepeatType);
	}

	public toggleMute() {
		const { muted, setConfigKey } = this.props;

		if (muted) {
			this.volumeChange(0.5);
		} else {
			this.volumeChange(0);
		}

		setConfigKey("audio.muted", !muted);
	}

	public changeSong(changeType: ChangeTypes) {
		const { changeTrack } = this.props;

		changeTrack(changeType);
	}

	public toggleShuffle() {
		const { shuffle, toggleShuffle } = this.props;

		toggleShuffle(!shuffle);
	}

	public renderProgressBar() {
		const {
			player: { currentTime, duration },
			setCurrentTime
		} = this.props;

		const { isSeeking, nextTime } = this.state;

		const sliderValue = isSeeking ? nextTime : currentTime;

		return (
			<Slider
				min={0}
				max={duration}
				value={sliderValue}
				stepSize={1}
				onChange={this.seekChange}
				labelRenderer={false}
				onRelease={val => {
					this.setState({
						isSeeking: false
					});

					if (this.audioRef && this.audioRef.audio) {
						this.audioRef.audio.currentTime = val;
					}

					setCurrentTime(val);
					ipcRenderer.send(EVENTS.PLAYER.SEEK_END, val);
				}}
			/>
		);
	}

	public renderAudio() {
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
		const { isVolumeSeeking, volume } = this.state;

		const { status, playingTrack } = player;

		if (!track || !playingTrack) {
			return null;
		}

		const audioVolume = isVolumeSeeking ? volume : configVolume;

		const url = track.stream_url
			? SC.appendClientId(track.stream_url, overrideClientId)
			: SC.appendClientId(`${track.uri}/stream`, overrideClientId);

		const limitReached = remainingPlays && remainingPlays.remaining === 0;

		if (remainingPlays && limitReached) {
			return (
				<div className={styles.rateLimit}>
					Stream limit reached! Unfortunately the API enforces a 15K plays/day limit. This limit will expire
					in{" "}
					<Tag className="ml-2" intent={Intent.PRIMARY}>
						{moment(remainingPlays.resetTime).fromNow()}
					</Tag>
				</div>
			);
		}

		const autoplay = status === PlayerStatus.PLAYING;
		const playingOnChromecast = !!chromecast.castApp;

		return (
			<ReactAudioPlayer
				ref={this.audio}
				src={url}
				autoPlay={autoplay}
				volume={audioVolume}
				muted={muted || playingOnChromecast}
				id={`${playingTrack.id}`}
				onLoadedMetadata={this.onLoad}
				onListen={this.onPlaying}
				onEnded={this.onFinishedPlaying}
				onError={(_e: ErrorEvent, message: string) => {
					addToast({
						message,
						intent: Intent.DANGER
					});
				}}
			/>
		);
	}

	public render() {
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
			muted,
			trackUser,
			setConfigKey
		} = this.props;

		const { nextTime, isSeeking, isVolumeSeeking, volume } = this.state;

		const { status, currentTime, playingTrack, duration } = player;

		if (!track || !playingTrack || !trackUser) {
			return null;
		}

		if (!track.title || !track.user) {
			return <div>Loading</div>;
		}

		const overlayImage = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

		const audioVolume = isVolumeSeeking ? volume : configVolume;

		let volumeIcon = "volume-full";

		if (muted || audioVolume === 0) {
			volumeIcon = "volume-mute";
		} else if (audioVolume !== 1) {
			volumeIcon = "volume-low";
		}

		return (
			<div className={styles.player}>
				<div className={styles.player_bg}>
					<FallbackImage noPlaceholder src={overlayImage} />
				</div>

				{this.renderAudio()}

				<div className="d-flex align-items-center">
					<TrackInfo
						title={track.title}
						id={track.id.toString()}
						userId={trackUser.id.toString()}
						username={trackUser.username}
						img={overlayImage}
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
						<div className={styles.time}>
							{getReadableTime(isSeeking ? nextTime : currentTime, false, true)}
						</div>
						<div className={styles.progressInner}>{this.renderProgressBar()}</div>
						<div className={styles.time}>{getReadableTime(duration, false, true)}</div>
					</div>

					<Popover
						className="mr-2"
						popoverClassName={styles.playerPopover}
						interactionKind={PopoverInteractionKind.HOVER}
						hoverOpenDelay={50}
						content={
							<div className={styles.playerVolume}>
								<Slider
									min={0}
									max={1}
									value={audioVolume}
									stepSize={0.1}
									vertical
									onChange={this.volumeChange}
									labelRenderer={false}
									onRelease={value => {
										this.setState({
											isVolumeSeeking: false
										});

										setConfigKey("audio.volume", value);
									}}
								/>
							</div>
						}>
						<a className={styles.control} href="javascript:void(0)" onClick={this.toggleMute}>
							<i className={`bx bx-${volumeIcon}`} />
						</a>
					</Popover>

					{!!chromecast.devices.length && (
						<Popover
							className="mr-2"
							popoverClassName={styles.playerPopover}
							onOpened={this.debounceDiscover}
							content={
								<div style={{ minWidth: 200 }}>
									<div className={styles.popoverTitle}>Nearby devices</div>
									{chromecast.devices.map(d => {
										return (
											<div
												role="button"
												key={d.id}
												className={styles.castDevice}
												onClick={() => {
													useChromeCast(
														chromecast.selectedDeviceId === d.id ? undefined : d.id
													);
												}}>
												{chromecast.selectedDeviceId === d.id && <i className="bx bx-stop" />}
												<div>
													{d.name}
													<div className={styles.castSub}>
														{chromecast.selectedDeviceId === d.id &&
															!chromecast.castApp &&
															"Connecting..."}
														{chromecast.selectedDeviceId === d.id && chromecast.castApp
															? "Casting"
															: null}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							}>
							<a
								className={cn(styles.control, {
									[styles.active]: !!chromecast.castApp
								})}
								href="javascript:void(0)">
								<i className="bx bx-cast" />
							</a>
						</Popover>
					)}

					<Popover popoverClassName={styles.playerPopover} content={<Queue />} position="bottom-right">
						<a className={styles.control} href="javascript:void(0)">
							<i className="bx bxs-playlist" />
						</a>
					</Popover>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
