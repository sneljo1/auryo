import { normalize, schema } from 'normalizr';
import { NormalizedResponse, SoundCloud } from '../../types';
import { playlistSchema, trackSchema, userSchema } from '../schemas';
import fetchToJson from './helpers/fetchToJson';

interface JsonResponse {
    collection: Array<SearchCollectionItem>;
    next_href?: string;
    future_href?: string;
    query_urn: string;
    total_results: number;
}

type SearchCollectionItem = SoundCloud.Track | SoundCloud.Playlist | SoundCloud.Comment;

export default function fetchSearch(url: string): Promise<{
    json: JsonResponse,
    normalized: NormalizedResponse
}> {
    return fetchToJson<JsonResponse>(url)
        .then((json) => ({
            normalized: normalize(json.collection, new schema.Array({
                playlists: playlistSchema,
                tracks: trackSchema,
                users: userSchema
            }, (input) => `${input.kind}s`)),
            json
        }));
}
