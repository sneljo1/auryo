import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { SoundCloud } from '@types';

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

export function fetchRemainingTracks() {
  return fetchToJsonNew<FetchRemainingTracksResponse>({
    uri: 'rate_limit_status',
    clientId: true
  });
}

export function resolveSoundCloudUrl(url: string) {
  return fetchToJsonNew<SoundCloud.Asset<any>>({
    uri: 'resolve',
    clientId: true,
    queryParams: {
      url
    }
  });
}
