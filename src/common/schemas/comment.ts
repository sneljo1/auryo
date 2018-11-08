import { schema } from 'normalizr';
import userSchema from './user';

const commentSchema = new schema.Entity('commentEntities', {
    user: userSchema,
});

export default commentSchema;
