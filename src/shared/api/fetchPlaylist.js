import { json, status } from '../utils'
import { playlistSchema, trackSchema } from '../schemas'
import { PLAYLISTS } from '../constants'
import { normalize, schema } from 'normalizr'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

export default function fetchPlaylist(url, playlist_type, hideReposts) {
    return fetch(url)
        .then(status)
        .then(json)
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
                        let info = item
                        let obj = item.track || item.playlist

                        obj.from_user = info.user

                        delete info.user

                        obj.info = info

                        delete item.track
                        delete item.playlist

                        return obj
                    })

                const normalized = normalize(collection, new schema.Array({
                    playlists: playlistSchema,
                    tracks: trackSchema
                }, (input, parent, key) => `${input.kind}s`))

                n = {
                    entities: normalized.entities,
                    result: uniqWith(normalized.result, isEqual)
                }


            } else if (json.collection) {
                let collection = json.collection

                if (json.genre) {
                    collection = collection.map(item => {
                        let track = item.track
                        track.score = item.score

                        return track
                    })
                }

                let schem = new schema.Array({
                    playlists: playlistSchema,
                    tracks: trackSchema
                }, (input, parent, key) => `${input.kind}s`)

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