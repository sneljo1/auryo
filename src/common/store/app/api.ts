import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { RemainingPlays } from './types';

interface FetchRemainingTracksResponse {
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

export async function fetchRemainingTracks(overrideClientId?: string | null): Promise<RemainingPlays | null> {
  try {
    const json = await fetchToJsonNew<FetchRemainingTracksResponse>({
      uri: 'rate_limit_status',
      clientId: overrideClientId ?? true
    });

    if (!json.statuses.length) {
      return null;
    }

    const plays = json.statuses.find(t => t.rate_limit.name === 'plays');

    if (plays) {
      return {
        remaining: plays.remaining_requests,
        resetTime: new Date(plays.reset_time).getTime()
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}
