import { normalize, schema } from 'normalizr';
import { playlistSchema } from '../schemas';
import { asJson, SC, status } from '../utils';
import { NormalizedResponse, SoundCloud } from '../../types';

type JsonResponse = Array<SoundCloud.Playlist>;

export default function fetchPlaylists(): Promise<{
    json: JsonResponse,
    normalized: NormalizedResponse
}> {
    return fetch(SC.getPlaylistUrl())
        .then(status)
        .then(asJson)
        .then((json) => {

            const normalized = normalize(json, new schema.Array({
                playlists: playlistSchema
            }, (input) => `${input.kind}s`));

            return {
                normalized,
                json
            };
        });
}
