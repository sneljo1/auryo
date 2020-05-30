import { StoreState } from 'AppReduxTypes';
import { isEqual } from 'lodash';
import { createSelector } from 'reselect';
import { PlaylistIdentifier } from '../types';
import { PlayerState, PlayingTrack } from './types';
import { Normalized, SoundCloud } from '@types';
import { PlaylistTypes } from '../objects';
import { AssetType } from 'src/types/soundcloud';

export const getPlayerNode = (state: StoreState) => state.player;

export const getPlayingTrack = createSelector([getPlayerNode], player => player.playingTrack);
export const getPlayerCurrentTime = createSelector([getPlayerNode], player => player.currentTime);
export const getPlayingTrackIndex = createSelector([getPlayerNode], player => player.currentIndex);
export const getPlayerUpNext = createSelector([getPlayerNode], player => player.upNext);
export const getPlayerStatus = createSelector([getPlayerNode], player => player.status);
export const getCurrentPlaylistId = createSelector([getPlayerNode], player => player.currentPlaylistId || null);

export const getNormalizedSchemaForType = (
  trackOrPlaylist: SoundCloud.Track | SoundCloud.Playlist
): Normalized.NormalizedResult => ({
  id: trackOrPlaylist.id,
  schema: trackOrPlaylist.kind === AssetType.PLAYLIST ? 'playlists' : 'tracks'
});

export const isPlayingSelector = (playlistId: PlaylistIdentifier, idResult?: Normalized.NormalizedResult) =>
  createSelector([getPlayingTrack], playingTrack => {
    if (!playingTrack) {
      return false;
    }

    if (!idResult) return isEqual(playingTrack.playlistId, playlistId);

    if (idResult.schema === 'playlists') {
      return isEqual(playingTrack.parentPlaylistID, {
        playlistType: PlaylistTypes.PLAYLIST,
        objectId: idResult.id.toString()
      });
    }

    return playingTrack.id === idResult.id && isEqual(playingTrack.playlistId, playlistId);
  });
