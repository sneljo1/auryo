import { normalize, schema } from 'normalizr';
import { NormalizedResponse, SoundCloud } from '../../types';
import { commentSchema } from '../schemas';
import { asJson, status } from '../utils';

interface JsonResponse { collection: Array<SoundCloud.Comment>; next_href?: string; future_href?: string; }

export default function fetchComments(url: string): Promise<{
    json: JsonResponse,
    normalized: NormalizedResponse
}> {
    return fetch(url)
        .then(status)
        .then(asJson)
        .then((json: JsonResponse) => {
            const { collection } = json;

            const n = normalize(collection, new schema.Array({
                comments: commentSchema
            }, (input) => `${input.kind}s`));

            return {
                normalized: n,
                json
            };
        });
}
