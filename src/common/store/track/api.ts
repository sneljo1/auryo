import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export async function fetchTrack(options: { trackId: string | number }) {
  const json = await fetchToJsonNew<SoundCloud.Track>({
    uri: `tracks/${options.trackId}`,
    oauthToken: true,
    useV2Endpoint: true
  });

  return json;
}

// Comments
export async function fetchComments(options: { trackId: number; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Comment>>({
    uri: `tracks/${options.trackId}/comments`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      threaded: 1,
      filter_replies: 0
    }
  });

  return json;
}

export async function fetchRelatedTracks(options: { trackId: string; userId: string | number; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `tracks/${options.trackId}/related`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      user_id: options.userId
    }
  });

  return json;
}
