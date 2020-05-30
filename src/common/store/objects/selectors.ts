import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';
import { PlaylistIdentifier, ObjectGroup, ObjectState, ObjectTypes, PlaylistTypes } from '../types';

export const getPlaylistsObjects = (state: StoreState) => state.objects[PlaylistTypes.PLAYLIST] ?? {};
export const getPlaylistRootObject = (playlistType: PlaylistTypes | ObjectTypes) => (state: StoreState) =>
  state.objects[playlistType] ?? {};

export const getPlaylistObjectSelector = (identifier: PlaylistIdentifier) =>
  createSelector<StoreState | StoreState, ObjectGroup | ObjectState, ObjectState | null>(
    [getPlaylistRootObject(identifier.playlistType)],
    playlistsOrObjectState =>
      identifier.objectId ? playlistsOrObjectState[identifier.objectId] : playlistsOrObjectState
  );

export const getQueuePlaylistSelector = (state: StoreState) => state.objects[PlaylistTypes.QUEUE] ?? {};
export const getQueueTrackByIndexSelector = (index: number) => (state: StoreState) =>
  state.objects[PlaylistTypes.QUEUE].items[index];

export const getCommentsObjects = (state: StoreState) => state.objects[ObjectTypes.COMMENTS] || {};

export const getCommentObject = (trackId?: string | number) =>
  createSelector<StoreState, ObjectGroup, ObjectState | null>([getCommentsObjects], comments =>
    trackId && trackId in comments ? comments[trackId] : null
  );

export const getPlaylistName = (id: string, playlistType: PlaylistTypes) => [id, playlistType].join('|');

export const getPlaylistType = (objectId: string): PlaylistTypes | null => {
  if (!objectId || typeof objectId !== 'string') {
    return null;
  }

  if (objectId in PlaylistTypes) {
    return objectId as PlaylistTypes;
  }

  const split = objectId.split('|');

  if (split.length !== 2) {
    return null;
  }

  return objectId.split('|')[1] as PlaylistTypes;
};
export const getRelatedTracksPlaylistObject = (trackId: string) =>
  getPlaylistObjectSelector({ objectId: trackId, playlistType: PlaylistTypes.RELATED });

export const getArtistLikesPlaylistObject = (artistId: string) =>
  getPlaylistObjectSelector({ objectId: artistId, playlistType: PlaylistTypes.ARTIST_LIKES });
export const getArtistTracksPlaylistObject = (artistId: string) =>
  getPlaylistObjectSelector({ objectId: artistId, playlistType: PlaylistTypes.ARTIST_TRACKS });
