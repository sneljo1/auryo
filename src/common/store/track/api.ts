import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export function fetchTrack(options: { trackId: string | number }) {
  return fetchToJsonNew<SoundCloud.Track>({
    uri: `tracks/${options.trackId}`,
    oauthToken: true
  });
}

export function fetchComments(options: { trackId: number; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Comment>>({
    uri: `tracks/${options.trackId}/comments`,
    oauthToken: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: true
    }
  });
}

export function fetchRelatedTracks(options: { trackId: string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `tracks/${options.trackId}/related`,
    oauthToken: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: true
    }
  });
}
