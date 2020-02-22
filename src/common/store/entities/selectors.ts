import { denormalize, schema } from 'normalizr';
import { createSelector } from 'reselect';
import { EntitiesState } from '.';
import { StoreState } from '..';
import { Normalized, SoundCloud } from '@types';
import { commentSchema, playlistSchema, trackSchema, userSchema } from '../../schemas';

export const getEntities = (state: StoreState) => state.entities;

export const getPlaylistEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['playlistEntities']>(
    getEntities,
    entities => entities.playlistEntities
  );
export const getUserEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['userEntities']>(
    getEntities,
    entities => entities.userEntities
  );

export const getCommentEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['commentEntities']>(
    getEntities,
    entities => entities.commentEntities
  );

export const getTrackEntities = () =>
  createSelector<StoreState, ReturnType<typeof getEntities>, EntitiesState['trackEntities']>(
    getEntities,
    entities => entities.trackEntities
  );

export const normalizeSchema = new schema.Array(
  {
    tracks: trackSchema,
    playlists: playlistSchema,
    users: userSchema,
    comments: commentSchema
  },
  input => `${input.kind}s`
);

export const getDenormalizedEntities = <T>(result: Normalized.NormalizedResult[]) =>
  createSelector<StoreState, ReturnType<typeof getEntities>, T[]>(getEntities, entities =>
    denormalize(result, normalizeSchema, entities)
  );

export const getDenormalizedEntity = <T>(result: Normalized.NormalizedResult) =>
  createSelector<StoreState, T[], T | null>(getDenormalizedEntities([result]), entities => entities[0]);

export const getMusicEntity = getDenormalizedEntity;
export const getUserEntity = (id: number) => getDenormalizedEntity<SoundCloud.User | null>({ id, schema: 'users' });
export const getTrackEntity = (id: number) => getDenormalizedEntity<SoundCloud.Track | null>({ id, schema: 'tracks' });
export const getPlaylistEntity = (id: number) =>
  getDenormalizedEntity<SoundCloud.Playlist | null>({ id, schema: 'playlists' });

export const getCommentEntity = (id: number) =>
  getDenormalizedEntity<SoundCloud.Comment | null>({ id, schema: 'comments' });

export const getNormalizedPlaylist = (id: number) =>
  createSelector<StoreState, EntitiesState['playlistEntities'], Normalized.Playlist | null>(
    getPlaylistEntities(),
    entities => entities[id]
  );

export const getNormalizedUser = (id: number) =>
  createSelector<StoreState, EntitiesState['userEntities'], SoundCloud.User | null>(
    getUserEntities(),
    entities => entities[id]
  );

export const getNormalizedTrack = (id: number) =>
  createSelector<StoreState, EntitiesState['trackEntities'], Normalized.Track>(
    getTrackEntities(),
    entities => entities[id]
  );
