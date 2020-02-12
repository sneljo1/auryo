import { normalize } from 'normalizr';
import { Normalized, SoundCloud } from '../../types';
import { trackSchema } from '../schemas';
// eslint-disable-next-line import/no-cycle
import { SC } from '../utils';
import fetchToJson from './helpers/fetchToJson';

type JsonResponse = SoundCloud.Track;

export default async function fetchTrack(
  trackId: string | number
): Promise<{
  json: JsonResponse;
  normalized: Normalized.NormalizedResponse;
}> {
  const json = await fetchToJson<JsonResponse>(SC.getTrackUrl(trackId));

  const normalized = normalize(json, trackSchema);

  return {
    normalized,
    json
  };
}
