import { EVENTS } from "@common/constants/events";
import { IMAGE_SIZES } from "@common/constants/Soundcloud";
import { getTrackEntity } from "@common/store/entities/selectors";
import { changeTrack, ChangeTypes, PlayerStatus, PlayingTrack, toggleStatus } from "@common/store/player";
import * as SC from "@common/utils/soundcloudUtils";
import { WatchState } from "../feature";
import { MediaService, MediaStates, MetaData, milliseconds } from "./interfaces/electron-media-service.interfaces";
import MacFeature from "./macFeature";

export default class MediaServiceManager extends MacFeature {

	private myService: MediaService | null = null;
	private readonly meta: MetaData = {
		state: MediaStates.STOPPED,
		title: "",
		id: -1,
		album: "",
		artist: "",
		duration: 0,
		currentTime: 0
	};

	public register() {
		const MediaService = require("electron-media-service");

		const myService = (this.myService = new MediaService());

		myService.startService();
		myService.setMetaData(this.meta);

		myService.on("play", () => {
			if (this.meta.state !== MediaStates.PLAYING) {
				this.store.dispatch(toggleStatus(PlayerStatus.PLAYING) as any)
			}
		});

		myService.on("pause", () => {
			if (this.meta.state !== MediaStates.PAUSED) {
				this.store.dispatch(toggleStatus(PlayerStatus.PAUSED) as any)
			}
		});

		myService.on("stop", () => {
			this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any)
		});

		myService.on("playPause", () => {
			this.store.dispatch(toggleStatus() as any)
		});

		myService.on("next", () => {
			this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any)
		});

		myService.on("previous", () => {
			this.store.dispatch(changeTrack(ChangeTypes.PREV) as any)
		});

		myService.on("seek", (to: milliseconds) => {
			this.sendToWebContents(EVENTS.PLAYER.SEEK, to / 1000);
		});

		//
		// WATCHERS
		//

		/**
		 * Update track information
		 */
		this.on(EVENTS.APP.READY, () => {
			this.subscribe<PlayingTrack>(["player", "playingTrack"], ({ currentState }) => {
				const {
					player: { playingTrack }
				} = currentState;

				if (playingTrack) {
					const trackId = playingTrack.id;
					const track = getTrackEntity(trackId)(this.store.getState());

					if (track) {
						this.meta.id = track.id;
						this.meta.title = track.title;

						this.meta.artist = track.user && track.user.username ? track.user.username : "Unknown artist";
						this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE);
						myService.setMetaData(this.meta);
					}
				}
			});

			/**
			 * Update playback status
			 */
			this.subscribe<PlayerStatus>(["player", "status"], ({ currentValue: status }: any) => {
				this.meta.state = status.toLowerCase();

				myService.setMetaData(this.meta);
			});

			/**
			 * Update time
			 */
			this.subscribe(["player", "currentTime"], this.updateTime);
			this.subscribe(["player", "duration"], this.updateTime);
		});
	}

	public updateTime = ({
		currentState: {
			player: { currentTime, duration }
		}
	}: WatchState<number>) => {
		this.meta.currentTime = currentTime * 1e3;
		this.meta.duration = duration * 1e3;

		if (this.myService) {
			this.myService.setMetaData(this.meta);
		}
	};

	public unregister() {
		super.unregister();

		if (this.myService && this.myService.isStarted()) {
			this.myService.stopService();
		}
	}
}
