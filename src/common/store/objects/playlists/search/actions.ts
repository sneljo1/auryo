import { canFetchMoreOf, fetchMore, ObjectTypes } from '../..';
import { ThunkResult } from '../../../../../types';
import fetchSearch from '../../../../api/fetchSearch';
import { SC } from '../../../../utils';
import { getPlaylistName, getPlaylistObject, getPlaylistType } from '../../selectors';
import { ObjectsActionTypes, PlaylistTypes } from '../../types';
import { Utils } from '../../../../../common/utils/utils';

export function isSoundCloudUrl(query: string) {
    console.log(decodeURIComponent(query));
    return /https?:\/\/(www.)?soundcloud\.com\//g.exec(query) !== null;
}

export function tryAndResolveQueryAsSoundCloudUrl(query: string) {
    if (isSoundCloudUrl(query)) {
        return Utils.resolveUrl(query);
    }
}

export function searchByTag(objectId: string, tag: string, limit?: number, offset?: number): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const state = getState();

        const tracklist_object = getPlaylistObject(objectId)(state);

        if (!tag) {
            dispatch({
                type: ObjectsActionTypes.UNSET,
                payload: {
                    objectId,
                    objectType: ObjectTypes.PLAYLISTS
                }
            });

            return Promise.resolve();
        }

        let url: string | null = null;

        switch (getPlaylistType(objectId)) {
            case PlaylistTypes.SEARCH_TRACK:
                url = SC.searchTagurl(tag, limit, offset); break;
            case PlaylistTypes.SEARCH_PLAYLIST:
                url = SC.discoverPlaylistsUrl(tag, limit, offset);
                break;
            default:
        }

        if (url !== null && !tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl)) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(url as string)
                        .then(({ normalized, json }) => ({
                            objectId,
                            objectType: ObjectTypes.PLAYLISTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                            refresh: true
                        })),
                    data: {
                        objectId,
                        objectType: ObjectTypes.PLAYLISTS
                    }
                }
            } as any);
        }

        return Promise.resolve();

    };
}

export function searchType(objectId: string, query: string, limit?: number, offset?: number): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const state = getState();

        const tracklist_object = getPlaylistObject(objectId)(state);

        if (!query) {
            dispatch({
                type: ObjectsActionTypes.UNSET,
                payload: {
                    objectId,
                    objectType: ObjectTypes.PLAYLISTS
                }
            });

            return Promise.resolve();
        }

        if (isSoundCloudUrl(query)) {
            return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query)) as any;
        }

        let url: string | null = null;

        switch (getPlaylistType(objectId)) {
            case PlaylistTypes.SEARCH_TRACK:
                url = SC.searchTracksUrl(query, limit, offset); break;
            case PlaylistTypes.SEARCH_PLAYLIST:
                url = SC.searchPlaylistsUrl(query, limit, offset); break;
            case PlaylistTypes.SEARCH_USER:
                url = SC.searchUsersUrl(query, limit, offset); break;
            default:
        }

        if (url !== null && !tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl)) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(url as string)
                        .then(({ normalized, json }) => ({
                            objectId,
                            objectType: ObjectTypes.PLAYLISTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                            refresh: true
                        })),
                    data: {
                        objectId,
                        objectType: ObjectTypes.PLAYLISTS
                    }
                }
            } as any);
        }

        return Promise.resolve();

    };
}

export function searchAll(query: string, limit?: number, offset?: number): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const { objects } = getState();

        const playlist_objects = objects[ObjectTypes.PLAYLISTS] || {};
        const objectId = getPlaylistName(query, PlaylistTypes.SEARCH);
        const tracklist_object = playlist_objects[objectId];

        if (!query) {
            dispatch({
                type: ObjectsActionTypes.UNSET,
                payload: {
                    objectId,
                    objectType: ObjectTypes.PLAYLISTS
                }
            });

            return Promise.resolve();
        }

        if (isSoundCloudUrl(query)) {
            return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query)) as any;
        }

        let shouldFetchMore = false;

        if (!tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl)) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(SC.searchAllUrl(query, limit, offset))
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
