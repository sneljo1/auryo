import { schema } from 'normalizr'

const trackInfoSchema = new schema.Entity('feedInfo_entities', {}, { idAttribute: 'uuid' })

export default trackInfoSchema