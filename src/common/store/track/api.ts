import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export function fetchTrack(options: { trackId: string | number }) {
  return fetchToJsonNew<SoundCloud.Track>({
    uri: `tracks/${options.trackId}`,
    oauthToken: true,
    useV2Endpoint: true
  });
}

// Comments
export function fetchComments(options: { trackId: number; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Comment>>({
    uri: `tracks/${options.trackId}/comments`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      threaded: 1,
      filter_replies: 0
    }
  });
}

export function fetchRelatedTracks(options: { trackId: string; userId: string | number; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `tracks/${options.trackId}/related`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      user_id: options.userId
    }
  });
}
