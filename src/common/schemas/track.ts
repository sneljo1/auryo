import { schema } from 'normalizr';
import userSchema from './user';

const trackSchema = new schema.Entity(
  'trackEntities',
  {
    user: userSchema
  },
  {
    processStrategy: entity => {
      if (entity.likes_count || entity.favoritings_count) {
        entity.likes_count = entity.likes_count || entity.favoritings_count;
      }

      return entity;
    }
  }
);

export default trackSchema;
