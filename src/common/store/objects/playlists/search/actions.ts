import fetchSearch from '@common/api/fetchSearch';
import { tryAndResolveQueryAsSoundCloudUrl } from '@common/store/app/actions';
import { isSoundCloudUrl, SC } from '@common/utils';
import { ThunkResult } from '@types';
import { getPlaylistObjectSelector, getPlaylistType } from '../../selectors';
import { ObjectsActionTypes, ObjectTypes, PlaylistTypes } from '../../types';

// export function search(
//   filter: { query?: string; tag?: string },
//   objectId: string,
//   limit?: number,
//   offset?: number
// ): ThunkResult<Promise<any>> {
//   return (dispatch, getState) => {
//     const state = getState();
//     const { query, tag } = filter;

//     const tracklistObject = getPlaylistObjectSelector(objectId)(state);

//     if (query && isSoundCloudUrl(query)) {
//       return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query, dispatch)) as any;
//     }

//     let url: string | null = null;

//     switch (getPlaylistType(objectId)) {
//       case PlaylistTypes.SEARCH:
//         if (query) {
//           url = SC.searchAllUrl(query, limit, offset);
//         }
//         break;
//       case PlaylistTypes.SEARCH_TRACK:
//         if (query) {
//           url = SC.searchTracksUrl(query, limit, offset);
//         } else if (tag) {
//           url = SC.searchTracksUrl(tag, limit, offset);
//         }
//         break;
//       case PlaylistTypes.SEARCH_PLAYLIST:
//         if (query) {
//           url = SC.searchPlaylistsUrl(query, limit, offset);
//         } else if (tag) {
//           url = SC.discoverPlaylistsUrl(tag, limit, offset);
//         }
//         break;
//       case PlaylistTypes.SEARCH_USER:
//         if (query) {
//           url = SC.searchUsersUrl(query, limit, offset);
//         }
//         break;
//       default:
//     }

//     if (
//       url &&
//       url.length &&
//       (!tracklistObject || (tracklistObject && !tracklistObject.isFetching && tracklistObject.nextUrl))
//     ) {
//       return dispatch<Promise<any>>({
//         type: ObjectsActionTypes.SET,
//         payload: {
//           promise: fetchSearch(url).then(({ normalized, json }) => {
//             return {
//               objectId,
//               objectType: ObjectTypes.PLAYLISTS,
//               entities: normalized.entities,
//               result: normalized.result,
//               nextUrl: json.next_href ? SC.appendToken(json.next_href) : null,
//               refresh: true
//             };
//           }),
//           data: {
//             objectId,
//             objectType: ObjectTypes.PLAYLISTS
//           }
//         }
//       } as any);
//     }

//     return Promise.resolve();
//   };
// }

// =====================================================

// type ObjectSet = {
//   objectId: string;
//   objectType: ObjectTypes;
//   entities: NormalizedEntities;
//   result: NormalizedResult;
//   nextUrl?: string;
// };

// export const searchAsync = createAsyncAction('SEARCH_REQUEST', 'SEARCH_SUCCESS', 'SEARCH_FAIL')<
//   { query: string },
//   any,
//   string
// >();
