import {SC, status, json} from "../utils";
import {playlistSchema} from "../schemas";
import {normalize, schema} from "normalizr";

export default function fetchPlaylists() {
    return fetch(SC.getPlaylistUrl())
        .then(status)
        .then(json)
        .then(json => {
            const n = normalize(json, new schema.Array(playlistSchema));

            return {
                normalized: n,
                json
            }
        })
}