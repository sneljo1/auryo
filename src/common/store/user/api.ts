import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';

export async function fetchUser(options: { userId: string | number }) {
  const json = await fetchToJsonNew<SoundCloud.User>({
    uri: `users/${options.userId}`,
    oauthToken: true,
    useV2Endpoint: true
  });

  return json;
}

export async function fetchUserTopTracks(options: { userId: number | string; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/toptracks`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });

  return json;
}
export async function fetchUserTracks(options: { userId: number | string; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/tracks`,
    clientId: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });

  return json;
}

export async function fetchUserLikes(options: { userId: string | string; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/likes`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      linked_partitioning: 1
    }
  });

  return json;
}

export async function fetchUserProfiles(options: { userUrn: string }) {
  const json = await fetchToJsonNew<SoundCloud.UserProfiles>({
    uri: `users/${options.userUrn}/web-profiles`,
    oauthToken: true,
    useV2Endpoint: true
  });

  return json;
}
