import { normalize, schema } from 'normalizr';
import { Normalized, SoundCloud } from '@types';
import { playlistSchema } from '../schemas';
// eslint-disable-next-line import/no-cycle
import { SC } from '../utils';
import fetchToJson from './helpers/fetchToJson';

type JsonResponse = SoundCloud.Playlist[];

export default async function fetchPlaylists(): Promise<{
  json: JsonResponse;
  normalized: Normalized.NormalizedResponse;
}> {
  const json: JsonResponse = await fetchToJson<JsonResponse>(SC.getPlaylistUrl());

  const normalized = normalize(
    json,
    new schema.Array(
      {
        playlists: playlistSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    normalized,
    json
  };
}
