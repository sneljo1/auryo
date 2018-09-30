import { schema } from 'normalizr';
import userSchema from './user';

const commentSchema = new schema.Entity('commentEntities', {
    user: userSchema,
}, {
        processStrategy: (entity) => ({ ...entity, id: String(entity.id) })
    });

export default commentSchema;
