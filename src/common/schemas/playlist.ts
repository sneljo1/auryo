import { schema } from 'normalizr';
import trackSchema from './track';
import userSchema from './user';

const playlistSchema = new schema.Entity('playlistEntities', {
  user: userSchema,
  tracks: new schema.Array(
    {
      tracks: trackSchema
    },
    (input) => `${input.kind}s`
  )
});

export default playlistSchema;
