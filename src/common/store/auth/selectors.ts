import { createSelector } from 'reselect';
import { AuthFollowing, AuthLikes, AuthState } from '.';
import { StoreState } from '..';
import { NormalizedResult } from '../../../types';
import { SC } from '../../utils';
import { EntitiesState } from '../entities';
import { getEntities } from '../entities/selectors';
import { ObjectGroup, ObjectState } from '../objects';
import { getPlaylistsObjects } from '../objects/selectors';
import { AuthReposts } from './types';

// SC.hasID(item.id, followings);

export const getAuth = (state: StoreState) => state.auth;

export const getFollowings = createSelector<StoreState, AuthState, AuthFollowing>(
    getAuth,
    (auth) => auth.followings || {}
);

export const getLikes = createSelector<StoreState, AuthState, AuthLikes>(
    getAuth,
    (auth) => auth.likes || {}
);
export const getReposts = createSelector<StoreState, AuthState, AuthReposts>(
    getAuth,
    (auth) => auth.reposts || {}
);

export const getUserPlaylists = createSelector<StoreState, AuthState, Array<NormalizedResult>>(
    getAuth,
    (auth) => auth.playlists || []
);

export type CombinedUserPlaylistState = { title: string, id: number } & ObjectState<NormalizedResult>;

export const getUserPlaylistsCombined = createSelector<
    StoreState,
    Array<NormalizedResult>,
    ObjectGroup,
    EntitiesState,
    Array<CombinedUserPlaylistState>
    >(
        getUserPlaylists,
        getPlaylistsObjects,
        getEntities,
        (playlists, objects, entities) => playlists.map((p) => ({
            ...objects[p.id],
            id: p.id,
            title: (entities.playlistEntities[p.id] || {}).title || ''
        }))
    );

export const isFollowing = (userId: number) => createSelector(
    getFollowings,
    (followings) => SC.hasID(userId, followings)
);
