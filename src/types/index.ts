import * as Normalized from "./normalized";
import * as SoundCloud from "./soundcloud";

export { SoundCloud, Normalized };

export interface GetPlaylistOptions {
	refresh?: boolean;
	appendId?: number | null;
}