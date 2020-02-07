/* eslint-disable camelcase */
// eslint-disable-next-line import/no-cycle
import { RemainingPlays } from '../store/app';
// eslint-disable-next-line import/no-cycle
import { SC } from '../utils';
import fetchToJson from './helpers/fetchToJson';

interface JsonResponse {
  statuses: Status[];
}

interface Status {
  rate_limit: {
    bucket: string;
    max_nr_of_requests: number;
    time_window: string;
    name: 'plays' | 'search';
  };
  remaining_requests: number;
  reset_time: string;
}

export async function fetchRemainingTracks(overrideClientId?: string): Promise<RemainingPlays | null> {
  try {
    const json = await fetchToJson<JsonResponse>(SC.getRemainingTracks(overrideClientId));
    if (json.statuses.length) {
      const plays = json.statuses.find(t => t.rate_limit.name === 'plays');

      if (plays) {
        return {
          remaining: plays.remaining_requests,
          resetTime: new Date(plays.reset_time).getTime()
        };
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}
