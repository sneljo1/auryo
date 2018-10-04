import { SoundCloud, Normalized, NormalizedResult } from '../../../types';

// TYPES

export enum ObjectTypes {
    PLAYLISTS = 'PLAYLISTS',
    COMMENTS = 'COMMENTS',
}

export interface ObjectsState extends Readonly<{
    [ObjectTypes.PLAYLISTS]: ObjectGroup,
    [ObjectTypes.COMMENTS]: ObjectGroup
}> { }

export interface ObjectGroup {
    [id: string]: ObjectState<NormalizedResult>;
}

export interface ObjectState<T> {
    isFetching: boolean;
    error: string | null;
    meta: object;
    items: Array<T>;
    futureUrl: string | null;
    nextUrl: string | null;
    fetchedItems: number;
}

export interface EntitiesState extends Readonly<{
    playlistEntities: {
        [playlistId: number]: Normalized.Playlist
    },
    trackEntities: {
        [trackId: number]: Normalized.Track
    },
    userEntities: {
        [userId: number]: SoundCloud.User
    },
    commentEntities: {
        [commentId: number]: SoundCloud.Comment
    }
}> { }

// ACTIONS

export const enum ObjectsActionTypes {
    SET = '@@objects/SET',
    UNSET = '@@objects/UNSET',
    SET_TRACKS = '@@objects/SET_TRACKS',
    UPDATE_ITEMS = '@@objects/UPDATE_ITEMS',
}