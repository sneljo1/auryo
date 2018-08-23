import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import { normalize, schema } from 'normalizr';
import { PLAYLISTS } from '../constants';
import { playlistSchema, trackSchema } from '../schemas';
import { asJson, status } from '../utils';

export default function fetchPlaylist(url, playlist_type, hideReposts) {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then(json => {

            let n = null

            if (playlist_type === PLAYLISTS.STREAM || playlist_type === PLAYLISTS.PLAYLISTS) {
                const collection = json.collection
                    .filter(info => {

                        if (playlist_type === PLAYLISTS.STREAM && hideReposts) {
                            return info.type.split('-')[1] !== 'repost'
                        }

                        return (info.track) || (info.playlist && info.playlist.track_count)
                    })
                    .map((item) => {
                        const info = item
                        const obj = item.track || item.playlist

                        obj.from_user = info.user

                        delete info.user

                        delete info.track
                        delete info.playlist

                        obj.info = info

                        return obj
                    })

                const normalized = normalize(collection, new schema.Array({
                    playlists: playlistSchema,
                    tracks: trackSchema
                }, (input) => `${input.kind}s`))

                n = {
                    entities: normalized.entities,
                    result: uniqWith(normalized.result, isEqual)
                }


            } else if (json.collection) {
                let { collection } = json

                if (json.genre) {
                    collection = collection.map(item => {
                        const { track } = item
                        track.score = item.score

                        return track
                    })
                }

                const schem = new schema.Array({
                    playlists: playlistSchema,
                    tracks: trackSchema
                }, (input) => `${input.kind}s`)

                n = normalize(collection, schem)
            } else {
                n = normalize(json, playlistSchema)
            }

            return {
                normalized: n,
                json
            }

        })
}