import { normalize } from "normalizr";
import { trackSchema } from "../schemas";
import { asJson, SC, status } from "../utils";

export default function fetchTrack(track_id) {
    return fetch(SC.getTrackUrl(track_id))
        .then(status)
        .then(asJson)
        .then(json => {
            const n = normalize(json, trackSchema);

            return {
                normalized: n,
                json
            };
        });

}