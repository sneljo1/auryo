import { schema } from 'normalizr';

const userSchema = new schema.Entity('userEntities', {}, {
    processStrategy: (entity) => ({ ...entity, id: String(entity.id) })
});

export default userSchema;
