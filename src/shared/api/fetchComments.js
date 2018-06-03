import {status, json} from "../utils";
import {commentSchema} from "../schemas";
import {normalize, schema} from "normalizr";

export default function fetchComments(url) {
    return fetch(url)
        .then(status)
        .then(json)
        .then(json => {
            const collection = json.collection;
            const n = normalize(collection, new schema.Array(commentSchema));

            return {
                normalized: n,
                json
            }
        })
}