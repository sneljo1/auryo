import { findIndex } from 'lodash';
import { PlayerState, PlayerStatus, PlayingTrack } from '../store/player';

export function isCurrentPlaylistPlaying(player: PlayerState, playlistId: string): boolean {
    return player.currentPlaylistId === playlistId && (player.status === PlayerStatus.PLAYING);
}

export function getCurrentPosition(player: { playingTrack: PlayingTrack | null, queue: Array<PlayingTrack> }): number {
    if (!player || !player.queue || !player.playingTrack) return -1;

    return findIndex(player.queue, player.playingTrack);
}
