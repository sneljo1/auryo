

import { createSelector } from 'reselect';
import { ObjectTypes, ObjectGroup, ObjectState } from '.';
import { StoreState } from '..';
import { NormalizedResult } from '../../../types';
import { PlaylistTypes } from './types';

export const getPlaylistsObjects = (state: StoreState) => state.objects[ObjectTypes.PLAYLISTS] || {};
export const getCommentsObjects = (state: StoreState) => state.objects[ObjectTypes.COMMENTS] || {};

export const getPlaylistObject = (playlistId: string) => createSelector<StoreState, ObjectGroup, ObjectState<NormalizedResult> | null>(
    [getPlaylistsObjects],
    (playlists) => (playlistId in playlists) ? playlists[playlistId] : null
);

export const getCommentObject = (trackId: string) => createSelector<StoreState, ObjectGroup, ObjectState<NormalizedResult> | null>(
    [getCommentsObjects],
    (comments) => (trackId in comments) ? comments[trackId] : null
);

export const getPlaylistName = (id: string, playlistType: PlaylistTypes) => [id, playlistType].join('|');
export const getPlaylistType = (objectId: string): PlaylistTypes => objectId.split('|')[1] as PlaylistTypes;

export const getRelatedTracksPlaylistObject = (trackId: string) => getPlaylistObject(getPlaylistName(trackId, PlaylistTypes.RELATED));

export const getArtistLikesPlaylistObject = (artistId: string) => getPlaylistObject(getPlaylistName(artistId, PlaylistTypes.ARTIST_LIKES));
export const getArtistTracksPlaylistObject = (artistId: string) => getPlaylistObject(getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS));
