import { findIndex } from 'lodash';
// eslint-disable-next-line import/no-cycle
import { PlayerState, PlayerStatus, PlayingTrack } from '../store/player';

export function isCurrentPlaylistPlaying(player: PlayerState, playlistId: string): boolean {
  return player.currentPlaylistId === playlistId && player.status === PlayerStatus.PLAYING;
}

export function getCurrentPosition(player: { playingTrack: PlayingTrack | null; queue: PlayingTrack[] }): number {
  if (!player || !player.queue || !player.playingTrack) {
    return -1;
  }

  return findIndex(player.queue, player.playingTrack);
}
