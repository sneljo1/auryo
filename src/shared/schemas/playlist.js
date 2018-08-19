import { schema } from 'normalizr';
import trackSchema from './track';
import userSchema from './user';

const playlistSchema = new schema.Entity('playlist_entities', {
    user: userSchema,
    tracks: [trackSchema]
})

export default playlistSchema