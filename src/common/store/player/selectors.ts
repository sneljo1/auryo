import { Normalized, SoundCloud } from '@types';
import { StoreState } from 'AppReduxTypes';
import { isEqual } from 'lodash';
import { createSelector } from 'reselect';
import { AssetType } from 'src/types/soundcloud';
import { PlaylistTypes } from '../objects';
import { PlaylistIdentifier } from '../types';

export const getPlayerNode = (state: StoreState) => state.player;

export const getPlayingTrackSelector = createSelector([getPlayerNode], (player) => player.playingTrack);
export const getPlayerCurrentTime = createSelector([getPlayerNode], (player) => player.currentTime);
export const getPlayingTrackIndex = createSelector([getPlayerNode], (player) => player.currentIndex);
export const getUpNextSelector = createSelector([getPlayerNode], (player) => player.upNext);
export const getPlayerStatusSelector = createSelector([getPlayerNode], (player) => player.status);
export const getCurrentPlaylistId = createSelector([getPlayerNode], (player) => player.currentPlaylistId || null);

export const upNextStartSelector = createSelector([getPlayingTrackIndex], (currentIndex) => currentIndex + 1);
export const upNextEndSelector = createSelector(
  [upNextStartSelector, getUpNextSelector],
  (upNextStart, upNext) => upNextStart + upNext.length
);

export const isIndexInUpNextSelector = (itemIndex: number) =>
  createSelector([upNextStartSelector, upNextEndSelector], (upNextStart, upNextEnd) => {
    return itemIndex >= upNextStart && itemIndex < upNextEnd;
  });

export const queuedTrackIndexSelector = (itemIndex: number) =>
  createSelector(
    [getPlayingTrackIndex, getUpNextSelector, isIndexInUpNextSelector(itemIndex), upNextEndSelector],
    (currentIndex, upNext, isIndexInUpNext, upNextEnd) => {
      if (isIndexInUpNext) {
        return itemIndex - currentIndex - 1;
      }

      if (itemIndex > upNextEnd) {
        return itemIndex - upNext.length;
      }

      return itemIndex;
    }
  );

export const getNormalizedSchemaForType = (
  trackOrPlaylist: SoundCloud.Track | SoundCloud.Playlist
): Normalized.NormalizedResult => ({
  id: trackOrPlaylist.id,
  schema: trackOrPlaylist.kind === AssetType.PLAYLIST ? 'playlists' : 'tracks'
});

export const isPlayingSelector = (playlistId: PlaylistIdentifier, idResult?: Normalized.NormalizedResult) =>
  createSelector([getPlayingTrackSelector], (playingTrack) => {
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
