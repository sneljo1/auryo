import {status, json} from "../utils";
import {trackSchema} from "../schemas";
import {normalize, schema} from "normalizr";

export default function fetchTrackList(url, except = {}) {
    return fetch(url)
        .then(status)
        .then(json)
        .then(json => {
            const collection = json.collection
                .filter(track => !(track.id in except));

            const n = normalize(collection, new schema.Array(trackSchema));

            return {
                normalized: n,
                json: json
            };
        });

}