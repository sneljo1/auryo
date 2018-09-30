import { ObjectTypes } from '../..';
import { ThunkResult } from '../../../../../types';
import fetchSearch from '../../../../api/fetchSearch';
import {  SEARCH_PLAYLISTS_SUFFIX, SEARCH_SUFFIX, SEARCH_TRACKS_SUFFIX, SEARCH_USERS_SUFFIX } from '../../../../constants';
import { SC } from '../../../../utils';
import { ObjectsActionTypes } from '../../types';

export function search(objectId: string, query: string, limit?: number, offset?: number): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const { objects } = getState();

        const playlist_objects = objects[ObjectTypes.PLAYLISTS] || {};
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

        let url: string = '';


        if (objectId.endsWith(SEARCH_TRACKS_SUFFIX)) {
            url = SC.searchTracksUrl(query, limit, offset);
        } else if (objectId.endsWith(SEARCH_PLAYLISTS_SUFFIX)) {
            url = SC.searchPlaylistsUrl(query, limit, offset);
        } else if (objectId.endsWith(SEARCH_USERS_SUFFIX)) {
            url = SC.searchUsersUrl(query, limit, offset);
        }

        if (!tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl)) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(url)
                        .then(({ normalized, json }) => ({
                            objectId,
                            objectType: ObjectTypes.PLAYLISTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: SC.appendToken(json.next_href),
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
        const objectId = query + SEARCH_SUFFIX;
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


        if (!tracklist_object || (tracklist_object && !tracklist_object.isFetching && tracklist_object.nextUrl)) {
            return dispatch<Promise<any>> ({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchSearch(SC.searchAllUrl(query, limit, offset))
                        .then(({ normalized, json }) => ({
                            objectId,
                            objectType: ObjectTypes.PLAYLISTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: SC.appendToken(json.next_href),
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
