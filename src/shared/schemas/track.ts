import { schema } from 'normalizr';
import userSchema from './user';

const trackSchema = new schema.Entity('trackEntities', {
    user: userSchema
},{
    processStrategy: (entity) => ({ 
        ...entity, 
        likes_count: entity.likes_count || entity.favoritings_count
      })
});

export default trackSchema;
