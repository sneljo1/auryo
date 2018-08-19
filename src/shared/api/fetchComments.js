import { normalize, schema } from "normalizr";
import { commentSchema } from "../schemas";
import { asJson, status } from "../utils";

export default function fetchComments(url) {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then(json => {
            const { collection } = json;
            
            const n = normalize(collection, new schema.Array(commentSchema));

            return {
                normalized: n,
                json
            }
        })
}