import { IMAGE_SIZES } from "@common/constants";
import { EVENTS } from "@common/constants/events";
import { getTrackEntity } from "@common/store/entities/selectors";
import { PlayingTrack } from "@common/store/player";
import { SC } from "@common/utils";
import { Auryo } from "@main/app";
import { Feature } from "../feature";

export default class NotificationManager extends Feature {
	constructor(auryo: Auryo) {
		super(auryo, "ready-to-show");
	}

	public register() {
		// Track changed
		this.subscribe<PlayingTrack>(["player", "playingTrack"], ({ currentState }) => {
			if (!this.win || (this.win && this.win.isFocused())) {
				return;
			}

			const {
				player: { playingTrack },
				config: {
					app: { showTrackChangeNotification }
				}
			} = currentState;

			if (playingTrack && showTrackChangeNotification) {
				const trackId = playingTrack.id;
				const track = getTrackEntity(trackId)(currentState);

				if (track) {
					this.sendToWebContents(EVENTS.APP.SEND_NOTIFICATION, {
						title: track.title,
						message: `${track.user && track.user.username ? track.user.username : ""}`,
						image: SC.getImageUrl(track, IMAGE_SIZES.SMALL)
					});
				}
			}
		});
	}
}
