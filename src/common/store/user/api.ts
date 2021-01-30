import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export function fetchUser(options: { userId: string | number }) {
  return fetchToJsonNew<SoundCloud.User>({
    uri: `users/${options.userId}`,
    oauthToken: true
  });
}

// TODO: not available on the public api
export function fetchUserTopTracks(options: { userId: number | string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/toptracks`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: true
    }
  });
}
export function fetchUserTracks(options: { userId: number | string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/tracks`,
    clientId: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: true
    }
  });
}

export function fetchUserProfiles(options: { userId: string }) {
  return fetchToJsonNew<SoundCloud.UserProfiles>({
    uri: `users/${options.userId}/web-profiles`,
    oauthToken: true
  });
}
