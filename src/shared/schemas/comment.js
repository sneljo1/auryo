import { schema } from "normalizr";
import userSchema from "./user";

const commentSchema = new schema.Entity('comment_entities', {
    user: userSchema,
});

export default commentSchema;