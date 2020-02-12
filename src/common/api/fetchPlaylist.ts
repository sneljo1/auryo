/* eslint-disable camelcase */
import { isEqual, uniqWith } from 'lodash';
import { normalize, schema } from 'normalizr';
import { SoundCloud, Normalized } from '@types';
import { playlistSchema, trackSchema, userSchema } from '../schemas';
// eslint-disable-next-line import/no-cycle
import { PlaylistTypes } from '../store/objects';
import fetchToJson from './helpers/fetchToJson';

interface CollectionItem {
  // tslint:disable-next-line: no-reserved-keywords
  type: 'playlist' | 'track' | 'track-repost' | 'playlist-repost';
  playlist?: SoundCloud.Playlist;
  track?: SoundCloud.Track;
  user: SoundCloud.CompactUser;
}

interface CollectionResponse {
  collection: CollectionItem[];
  next_href?: string;
  future_href?: string;
}

type JsonResponse = CollectionResponse | ChartResponse | SoundCloud.Playlist[];

interface ChartCollectionItem {
  score: number;
  track: SoundCloud.Track;
}
interface ChartResponse {
  collection: ChartCollectionItem[];
  genre: string;
  kind: 'top' | 'trending';
  last_updated: SoundCloud.DateString;
  next_href?: string;
  query_urn?: string;
}

export default async function fetchPlaylist(
  url: string,
  objectId: string,
  hideReposts = false
): Promise<{
  json: any;
  normalized: Normalized.NormalizedResponse;
}> {
  const json: JsonResponse = await fetchToJson<JsonResponse>(url);

  let normalized = null;

  if (objectId === PlaylistTypes.STREAM || objectId === PlaylistTypes.PLAYLISTS) {
    const { collection } = json as CollectionResponse;

    const processedColletion = collection
      .filter(info => {
        if (objectId === PlaylistTypes.STREAM && hideReposts) {
          return info.type.split('-')[1] !== 'repost';
        }

        return info.track || (info.playlist && info.playlist.track_count);
      })
      .map(item => {
        const obj: any = item.track || item.playlist;

        obj.from_user = item.user;
        obj.type = item.type;

        return obj;
      });

    normalized = normalize(
      processedColletion,
      new schema.Array(
        {
          playlists: playlistSchema,
          tracks: trackSchema,
          users: userSchema
        },
        input => `${input.kind}s`
      )
    );

    // Stream could have duplicate items
    normalized.result = uniqWith(normalized.result, isEqual);
  } else if ((json as any).collection) {
    // When charts
    const { collection, genre } = json as ChartResponse;

    // tslint:disable-next-line: no-any
    let items: SoundCloud.Track[] = collection as any[];

    if (genre) {
      items = collection.map(item => {
        const { track } = item;
        track.score = item.score;

        return track;
      });
    }

    normalized = normalize(
      items,
      new schema.Array(
        {
          playlists: playlistSchema,
          tracks: trackSchema,
          users: userSchema
        },
        input => `${input.kind}s`
      )
    );
  } else {
    normalized = normalize(json, playlistSchema);
  }

  return {
    normalized,
    json
  };
}
