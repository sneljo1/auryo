import {PLAYER_STATUS} from "../constants";
import findIndex from "lodash/findIndex";

export function isCurrentPlaylistPlaying(player, playlistId) {
    return player.currentPlaylistId == playlistId && (player.status == PLAYER_STATUS.PLAYING);
}

export function getCurrentPosition(player, track) {
    if (player.queue && player.playingTrack) {
        return findIndex(player.queue, player.playingTrack)
    }
    return findIndex(player, track);
}