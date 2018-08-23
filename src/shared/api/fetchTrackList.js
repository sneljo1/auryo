import { normalize, schema } from "normalizr";
import { trackSchema } from "../schemas";
import { asJson, status } from "../utils";

export default function fetchTrackList(url, except = {}) {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then(json => {
            const collection = json.collection
                .filter(track => !(track.id in except));

            const n = normalize(collection, new schema.Array(trackSchema));

            return {
                normalized: n,
                json
            };
        });

}