/* eslint-disable camelcase */
import { Normalized, SoundCloud } from '@types';
import { normalize, schema } from 'normalizr';
import { commentSchema } from '../schemas';
import fetchToJson from './helpers/fetchToJson';

interface JsonResponse {
  collection: SoundCloud.Comment[];
  next_href?: string;
  future_href?: string;
}

export default async function fetchComments(
  url: string
): Promise<{
  json: JsonResponse;
  normalized: Normalized.NormalizedResponse;
}> {
  const json = await fetchToJson<JsonResponse>(url);

  const { collection } = json;

  const n = normalize(
    collection,
    new schema.Array(
      {
        comments: commentSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    normalized: n,
    json
  };
}
