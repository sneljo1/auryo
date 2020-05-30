import { Collection, EntitiesOf, Normalized } from '@types';
import { normalize, schema } from 'normalizr';
import commentSchema from './comment';
import playlistSchema from './playlist';
import trackSchema from './track';
import userSchema from './user';

export const genericSchema = new schema.Array(
  {
    comments: commentSchema,
    playlists: playlistSchema,
    tracks: trackSchema,
    users: userSchema
  },
  input => `${input.kind}s`
);

export const normalizeArray = <T>(data: T[]) => {
  const normalized = normalize<T, EntitiesOf<T>, Normalized.NormalizedResult[]>(data, genericSchema);

  return {
    data,
    normalized
  };
};

export const normalizeCollection = <T>(json: Collection<T>) => {
  const normalized = normalize<T, EntitiesOf<T>, Normalized.NormalizedResult[]>(json.collection, genericSchema);

  return {
    json,
    normalized
  };
};

export { playlistSchema, userSchema, trackSchema, commentSchema };
