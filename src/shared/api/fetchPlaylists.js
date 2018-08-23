import { normalize, schema } from "normalizr";
import { playlistSchema } from "../schemas";
import { asJson, SC, status } from "../utils";

export default function fetchPlaylists() {
    return fetch(SC.getPlaylistUrl())
        .then(status)
        .then(asJson)
        .then(json => {
            const n = normalize(json, new schema.Array(playlistSchema));

            return {
                normalized: n,
                json
            }
        })
}