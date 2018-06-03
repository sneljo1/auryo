import { schema } from 'normalizr'
import userSchema from './user'
import trackSchema from './track'

const playlistSchema = new schema.Entity('playlist_entities', {
    user: userSchema,
    tracks: [trackSchema]
})

export default playlistSchema