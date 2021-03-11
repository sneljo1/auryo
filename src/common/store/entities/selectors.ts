import { Normalized, SoundCloud } from '@types';
import { StoreState } from 'AppReduxTypes';
import { denormalize } from 'normalizr';
import { createSelector } from 'reselect';
import { EntitiesState } from '../types';
import { genericSchema } from '@common/schemas';

export const getEntities = (state: StoreState) => state.entities;

export const getPlaylistEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['playlistEntities']>(
    getEntities,
    (entities) => entities.playlistEntities
  );
export const getUserEntities = () => createSelector(getEntities, (entities) => entities.userEntities);
export const getUserProfilesEntities = () => createSelector(getEntities, (entities) => entities.userProfileEntities);

export const getCommentEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['commentEntities']>(
    getEntities,
    (entities) => entities.commentEntities
  );

export const getTrackEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['trackEntities']>(
    getEntities,
    (entities) => entities.trackEntities
  );

export const getDenormalizedEntities = <T>(result: Normalized.NormalizedResult[]) =>
  createSelector<StoreState, ReturnType<typeof getEntities>, T[]>(getEntities, (entities) =>
    denormalize(result, genericSchema, entities)
  );

export const getDenormalizedEntity = <T>(result: Normalized.NormalizedResult) =>
  createSelector<StoreState, T[], T | null>(getDenormalizedEntities([result]), (entities) => entities[0]);

export const getMusicEntity = getDenormalizedEntity;
export const getUserEntity = (id: number) => getDenormalizedEntity<SoundCloud.User | null>({ id, schema: 'users' });
export const getTrackEntity = (id: number | string) =>
  getDenormalizedEntity<SoundCloud.Track | null>({ id: +id, schema: 'tracks' });
export const getPlaylistEntity = (id: number | string) =>
  getDenormalizedEntity<SoundCloud.Playlist | null>({ id: +id, schema: 'playlists' });

export const getCommentEntity = (id: number) =>
  getDenormalizedEntity<SoundCloud.Comment | null>({ id, schema: 'comments' });

export const getNormalizedPlaylist = (id: string | number) =>
  createSelector<StoreState, EntitiesState['playlistEntities'], Normalized.Playlist | null>(
    getPlaylistEntities(),
    (entities) => entities[id]
  );

export const getNormalizedUser = (id?: number | string) =>
  createSelector<StoreState, EntitiesState['userEntities'], SoundCloud.User | undefined | null>(
    getUserEntities(),
    (entities) => (id ? entities[id] : null)
  );

export const getNormalizedUserForPage = (id?: number | string) =>
  createSelector(getNormalizedUser(id), (user) => {
    if (user?.followers_count !== undefined && user?.followings_count !== undefined) {
      return user;
    }

    return null;
  });

export const getNormalizedTrack = (id?: number | string) =>
  createSelector<StoreState, EntitiesState['trackEntities'], Normalized.Track | undefined | null>(
    getTrackEntities(),
    (entities) => {
      if (id) {
        const track = entities[id];

        if (track) {
          return track;
        }
      }

      return null;
    }
  );

export const getNormalizedUserProfiles = (userId?: string) =>
  createSelector(getUserProfilesEntities(), (entities) => (userId ? entities?.[userId] : null));
