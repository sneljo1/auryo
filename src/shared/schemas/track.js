import { schema } from 'normalizr';
import userSchema from './user';

const trackSchema = new schema.Entity('track_entities', {
    user: userSchema
})

export default trackSchema