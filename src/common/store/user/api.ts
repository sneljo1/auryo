import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export function fetchUser(options: { userId: string | number }) {
  return fetchToJsonNew<SoundCloud.User>({
    uri: `users/${options.userId}`,
    oauthToken: true,
    useV2Endpoint: true
  });
}

export function fetchUserTopTracks(options: { userId: number | string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/toptracks`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });
}
export function fetchUserTracks(options: { userId: number | string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/tracks`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });
}

export function fetchUserLikes(options: { userId: string | string; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/likes`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });
}

export function fetchUserProfiles(options: { userUrn: string }) {
  return fetchToJsonNew<SoundCloud.UserProfiles>({
    uri: `users/${options.userUrn}/web-profiles`,
    oauthToken: true,
    useV2Endpoint: true
  });
}
