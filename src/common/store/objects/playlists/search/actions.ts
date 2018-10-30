import { canFetchMoreOf, fetchMore, ObjectTypes } from '../..';
import { Utils } from '../../../../../common/utils/utils';
import { ThunkResult } from '../../../../../types';
import fetchSearch from '../../../../api/fetchSearch';
import { SC } from '../../../../utils';
import { getPlaylistObject, getPlaylistType } from '../../selectors';
import { ObjectsActionTypes, PlaylistTypes } from '../../types';

export function isSoundCloudUrl(query: string) {
    return /https?:\/\/(www.)?soundcloud\.com\//g.exec(query) !== null;
}

export function tryAndResolveQueryAsSoundCloudUrl(query: string) {
    if (isSoundCloudUrl(query)) {
        return Utils.resolveUrl(query);
    }
}

export function search(filter: { query?: string, tag?: string }, objectId: string, limit?: number, offset?: number): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const state = getState();
        const { query, tag } = filter;

        const tracklist_object = getPlaylistObject(objectId)(state);

        if (query && isSoundCloudUrl(query)) {
            return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query)) as any;
        }

        let url: string | null = null;

        switch (getPlaylistType(objectId)) {
            case PlaylistTypes.SEARCH:
                url = SC.searchAllUrl(query, limit, offset); break;
            case PlaylistTypes.SEARCH_TRACK:
                url = query ? SC.searchTracksUrl(query, limit, offset) : SC.searchTagurl(tag, limit, offset); break;
            case PlaylistTypes.SEARCH_PLAYLIST:
                url = query ? SC.searchPlaylistsUrl(query, limit, offset) : SC.discoverPlaylistsUrl(tag, limit, offset); break;
            case PlaylistTypes.SEARCH_USER:
                url = SC.searchUsersUrl(query, limit, offset); break;
            default:
        }

        let shouldFetchMore = false;

        if (url && url.length && (!tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl))) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(url)
                        .then(({ normalized, json }) => {

                            if (normalized.result.length < 15) {
                                shouldFetchMore = true;
                            }

                            return {
                                objectId,
                                objectType: ObjectTypes.PLAYLISTS,
                                entities: normalized.entities,
                                result: normalized.result,
                                nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                                refresh: true
                            };
                        }),
                    data: {
                        objectId,
                        objectType: ObjectTypes.PLAYLISTS
                    }
                }
            } as any)
                .then(() => {
                    if (shouldFetchMore && dispatch(canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS))) {
                        dispatch(fetchMore(objectId, ObjectTypes.PLAYLISTS));
                    }
                });
        }

        return Promise.resolve();

    };
}
