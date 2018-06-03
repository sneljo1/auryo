import {SC, status, json} from "../utils";
import {trackSchema} from "../schemas";
import {normalize} from "normalizr";

export default function fetchTrack(track_id) {
    return fetch(SC.getTrackUrl(track_id))
        .then(status)
        .then(json)
        .then(json => {
            const n = normalize(json, trackSchema);

            return {
                normalized: n,
                json: json
            };
        });

}