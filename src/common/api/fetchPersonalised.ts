import { normalize, schema } from 'normalizr';
import { NormalizedEntities, NormalizedPersonalizedItem, SoundCloud } from '../../types';
import { playlistSchema } from '../schemas';
import fetchToJson from './helpers/fetchToJson';

interface JsonResponse {
    collection: Array<PersonalisedCollectionItem>;
    next_href?: string;
    query_urn: string;
}

export interface PersonalisedCollectionItem {
    urn: string;
    query_urn: string;
    title: string;
    description: string;
    tracking_feature_name: string;
    last_updated: string;
    style: string;
    social_proof: SoundCloud.CompactUser;
    system_playlists: Array<SoundCloud.SystemPlaylist>;
}


export default async function fetchPersonalised(url: string): Promise<{
    json: JsonResponse,
    normalized: {
        entities: NormalizedEntities;
        result: Array<NormalizedPersonalizedItem>;
    }
}> {
    try {
        const json = await fetchToJson<JsonResponse>(url);

        const collection = json.collection.filter((t) => t.urn.indexOf('chart') === -1);

        return ({
            normalized: normalize(collection, new schema.Array(new schema.Object({
                system_playlists: new schema.Array(playlistSchema),
                playlists: new schema.Array(playlistSchema)
            }))),
            json
        });

    } catch (err) {
        throw err;
    }
}
