import { ThunkResult } from '@common/store';
// eslint-disable-next-line import/no-cycle
import fetchSearch from '../../../../api/fetchSearch';
import { SC } from '../../../../utils';
import { canFetchMoreOf, fetchMore } from '../../actions';
import { getPlaylistObjectSelector, getPlaylistType } from '../../selectors';
import { ObjectsActionTypes, ObjectTypes, PlaylistTypes } from '../../types';
import { Dispatch } from 'redux';
import { resolveUrl } from '@common/store/app/actions';

export function isSoundCloudUrl(query: string) {
  return /https?:\/\/(www.)?soundcloud\.com\//g.exec(query) !== null;
}

export function tryAndResolveQueryAsSoundCloudUrl(query: string, dispatch: Dispatch) {
  if (isSoundCloudUrl(query)) {
    return dispatch(resolveUrl(query) as any);
  }

  return null;
}

export function search(
  filter: { query?: string; tag?: string },
  objectId: string,
  limit?: number,
  offset?: number
): ThunkResult<Promise<any>> {
  return (dispatch, getState) => {
    const state = getState();
    const { query, tag } = filter;

    const tracklistObject = getPlaylistObjectSelector(objectId)(state);

    if (query && isSoundCloudUrl(query)) {
      return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query, dispatch)) as any;
    }

    let url: string | null = null;

    switch (getPlaylistType(objectId)) {
      case PlaylistTypes.SEARCH:
        if (query) {
          url = SC.searchAllUrl(query, limit, offset);
        }
        break;
      case PlaylistTypes.SEARCH_TRACK:
        if (query) {
          url = SC.searchTracksUrl(query, limit, offset);
        } else if (tag) {
          url = SC.searchTracksUrl(tag, limit, offset);
        }
        break;
      case PlaylistTypes.SEARCH_PLAYLIST:
        if (query) {
          url = SC.searchPlaylistsUrl(query, limit, offset);
        } else if (tag) {
          url = SC.discoverPlaylistsUrl(tag, limit, offset);
        }
        break;
      case PlaylistTypes.SEARCH_USER:
        if (query) {
          url = SC.searchUsersUrl(query, limit, offset);
        }
        break;
      default:
    }

    let shouldFetchMore = false;

    if (
      url &&
      url.length &&
      (!tracklistObject || (tracklistObject && !tracklistObject.isFetching && tracklistObject.nextUrl))
    ) {
      return dispatch<Promise<any>>({
        type: ObjectsActionTypes.SET,
        payload: {
          promise: fetchSearch(url).then(({ normalized, json }) => {
            if (normalized.result.length < 15) {
              shouldFetchMore = true;
            }

            return {
              objectId,
              objectType: ObjectTypes.PLAYLISTS,
              entities: normalized.entities,
              result: normalized.result,
              nextUrl: json.next_href ? SC.appendToken(json.next_href) : null,
              refresh: true
            };
          }),
          data: {
            objectId,
            objectType: ObjectTypes.PLAYLISTS
          }
        }
      } as any).then(() => {
        if (shouldFetchMore && dispatch(canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS))) {
          dispatch(fetchMore(objectId, ObjectTypes.PLAYLISTS));
        }
      });
    }

    return Promise.resolve();
  };
}
