import { normalize } from 'normalizr';
import { trackSchema } from '../schemas';
import { asJson, SC, status } from '../utils';
import { NormalizedResponse, SoundCloud } from '../../types';

type JsonResponse = SoundCloud.Track;

export default function fetchTrack(trackId: string): Promise<{
    json: JsonResponse,
    normalized: NormalizedResponse
}> {
    return fetch(SC.getTrackUrl(trackId))
        .then(status)
        .then(asJson)
        .then((json: JsonResponse) => {
            const normalized = normalize(json, trackSchema);

            return {
                normalized,
                json
            };
        });

}
