import { normalize, schema } from 'normalizr';
import { action } from 'typesafe-actions';
import { GetPlaylistOptions, NormalizedEntities, NormalizedResult, SoundCloud, ThunkResult } from '../../../types';
import fetchComments from '../../api/fetchComments';
import fetchPlaylist from '../../api/fetchPlaylist';
import fetchToJson from '../../api/helpers/fetchToJson';
import { trackSchema } from '../../schemas';
import { SC } from '../../utils';
import { PlayerActionTypes, ProcessedQueueItems, processQueueItems } from '../player';
import { SortTypes } from '../playlist/types';
import { getPlaylistObjectSelector } from './selectors';
import { ObjectsActionTypes, ObjectState, ObjectTypes } from './types';

const canFetch = (current: ObjectState<any>): boolean => !current || (!!current && !current.isFetching);
const canFetchMore = (current: ObjectState<any>): boolean => canFetch(current) && (current && current.nextUrl !== null);

/**
 * Check if there is more to fetch, if so, fetch more
 *
 * @param objectId
 * @param type
 * @returns {function(*, *)}
 */
export function fetchMore(objectId: string, objectType: ObjectTypes): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const { objects } = getState();
        const object_group = objects[objectType] || {};

        if (canFetchMore(object_group[objectId])) {
            const { nextUrl } = object_group[objectId];

            if (nextUrl) {
                switch (objectType) {
                    case ObjectTypes.PLAYLISTS:
                        return dispatch<Promise<any>>(getPlaylist(nextUrl, objectId));
                    case ObjectTypes.COMMENTS:
                        return dispatch<Promise<any>>(getCommentsByUrl(nextUrl, objectId));
                    default:
                        break;
                }
            }
        }

        return Promise.resolve();
    };
}

export function canFetchMoreOf(objectId: string, type: ObjectTypes): ThunkResult<boolean> {
    return (_dispatch, getState) => {
        const { objects } = getState();
        const object_group = objects[type] || {};
        const object = object_group[objectId];

        return canFetchMore(object);
    };

}

// TODO refactor, too hacky. Maybe redux-observables?
// tslint:disable-next-line:max-line-length
export function getPlaylist(url: string, objectId: string, options: GetPlaylistOptions = { refresh: false, appendId: null }): ThunkResult<Promise<any>> {
    return async (dispatch, getState) => {
        const { config: { hideReposts } } = getState();

        try {
            const { value } = await dispatch<Promise<{ value: { result: Array<NormalizedResult> } }>>({
                type: ObjectsActionTypes.SET,
                payload: {
                    promise: fetchPlaylist(url, objectId, hideReposts)
                        .then(({ normalized, json }) => ({
                            objectId,
                            objectType: ObjectTypes.PLAYLISTS,
                            entities: normalized.entities,
                            result: options.appendId ? [{ id: options.appendId, schema: 'tracks' }, ...normalized.result] : normalized.result,
                            nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                            futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null,
                            refresh: options.refresh
                        })),
                    data: {
                        objectId,
                        objectType: ObjectTypes.PLAYLISTS
                    }
                }
            } as any);

            const { player: { currentPlaylistId, queue } } = getState();

            if (objectId === currentPlaylistId && value.result.length) {

                if (value && value.result) {

                    const { result } = value;

                    if (result.length) {

                        const [items, originalItems] = await dispatch<Promise<ProcessedQueueItems>>(processQueueItems(result));

                        dispatch({
                            type: PlayerActionTypes.QUEUE_INSERT,
                            payload: {
                                items,
                                originalItems,
                                index: queue.length
                            }
                        });
                    }
                }


            }

        } catch (err) {
            throw err;
        }
    };
}

export function getComments(trackId: number) {
    return getCommentsByUrl(SC.getCommentsUrl(trackId), trackId.toString());
}

function getCommentsByUrl(url: string, objectId: string): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const { objects } = getState();

        const objectType = ObjectTypes.COMMENTS;
        const comments = objects[objectType];

        if (!canFetch(comments[objectId])) return Promise.resolve();

        return dispatch<Promise<any>>({
            type: ObjectsActionTypes.SET,
            payload: {
                promise: fetchComments(url)
                    .then(({ normalized, json }) => ({
                        objectId,
                        objectType,
                        entities: normalized.entities,
                        result: normalized.result,
                        nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                        futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null
                    })),
                data: {
                    objectId,
                    objectType
                }
            }
        } as any);
    };
}

export const setObject = (
    objectId: string,
    objectType: ObjectTypes,
    entities: NormalizedEntities,
    result: Array<NormalizedResult>,
    nextUrl = null,
    futureUrl = null,
    fetchedItems = 0
) => {
    return action(ObjectsActionTypes.SET, {
        objectId,
        objectType,
        entities,
        result,
        nextUrl: (nextUrl) ? SC.appendToken(nextUrl) : null,
        futureUrl: (futureUrl) ? SC.appendToken(futureUrl) : null,
        fetchedItems
    });
};


export function fetchPlaylistIfNeeded(playlistId: number): ThunkResult<Promise<any>> {
    return async (dispatch, getState) => {

        try {

            const playlist_object = getPlaylistObjectSelector(playlistId.toString())(getState());

            if (playlist_object && !playlist_object.fetchedItems) {
                dispatch<Promise<any>>(fetchPlaylistTracks(playlistId));
            }

            if (!playlist_object || (playlist_object && playlist_object.fetchedItems === 0)) {
                await dispatch<Promise<any>>({
                    type: ObjectsActionTypes.SET,
                    payload: {
                        promise: fetchPlaylist(SC.getPlaylistTracksUrl(playlistId), playlistId.toString())
                            .then(({
                                normalized,
                                json
                            }) => {
                                if (normalized.entities && normalized.entities.playlistEntities) {
                                    const playlist = normalized.entities.playlistEntities[playlistId];

                                    let fetchedItems = normalized.result.length;

                                    if (json.tracks) {
                                        fetchedItems = json.tracks.filter((t: Partial<SoundCloud.Track>) => t.user !== undefined).length;
                                    }

                                    return {
                                        objectId: playlistId,
                                        objectType: ObjectTypes.PLAYLISTS,
                                        entities: normalized.entities,
                                        result: playlist.tracks,
                                        nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                                        futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null,
                                        fetchedItems
                                    };
                                }

                                return {};
                            }),
                        data: {
                            objectId: playlistId,
                            objectType: ObjectTypes.PLAYLISTS
                        }
                    }
                } as any);

                dispatch<Promise<any>>(fetchPlaylistTracks(playlistId));
            }

        } catch (err) {
            throw err;
        }
    };
}

/**
 * Fetch new chart if needed
 *
 * @returns {function(*, *)}
 * @param objectId
 * @param sortType
 */
export function fetchChartsIfNeeded(objectId: string, sortType: SortTypes = SortTypes.TOP): ThunkResult<void> {
    return (dispatch, getState) => {

        const playlist_object = getPlaylistObjectSelector(objectId)(getState());

        if (!playlist_object) {
            dispatch(getPlaylist(SC.getChartsUrl(objectId.split('_')[0], sortType, 25), objectId));
        }
    };
}

export function canFetchPlaylistTracks(playlistId: string): ThunkResult<void> {
    return (_dispatch, getState) => {

        const playlist_object = getPlaylistObjectSelector(playlistId)(getState());

        if (!playlist_object || playlist_object.fetchedItems === playlist_object.items.length || playlist_object.isFetching) {
            return false;
        }

        let new_count = playlist_object.fetchedItems + 20;

        if (new_count > playlist_object.items.length) {
            new_count = playlist_object.items.length;
        }

        const ids = playlist_object.items.slice(playlist_object.fetchedItems, new_count);

        return !!ids.length;


    };
}

export function fetchPlaylistTracks(playlistId: number, size: number = 20, ids?: Array<NormalizedResult>): ThunkResult<Promise<any>> {
    return async (dispatch, getState) => {

        const playlist_object = getPlaylistObjectSelector(playlistId.toString())(getState());

        if (!playlist_object) {
            await dispatch(fetchPlaylistIfNeeded(playlistId));

            return;
        }

        if ((playlist_object.fetchedItems === playlist_object.items.length || playlist_object.isFetching) && !ids) {
            return;
        }

        if (!ids) {
            const fetched = playlist_object.fetchedItems || 0;

            let new_count = fetched + size;

            if (new_count > playlist_object.items.length) {
                new_count = playlist_object.items.length;
            }

            ids = playlist_object.items.slice(fetched, new_count);

        }

        if (ids && ids.length) {
            return dispatch<Promise<any>>({
                type: ObjectsActionTypes.SET_TRACKS,
                payload: {
                    promise: fetchToJson(SC.getTracks(ids.map((id) => id.id)))
                        .then((tracks) => {

                            const normalized = normalize(tracks, new schema.Array({
                                tracks: trackSchema
                            }, (input) => `${input.kind}s`));

                            return {
                                objectId: playlistId,
                                objectType: ObjectTypes.PLAYLISTS,
                                entities: normalized.entities,
                                fetchedItems: size,
                                fetchedIds: normalized.result,
                                shouldFetchedIds: ids,
                            };
                        }),
                    data: {
                        objectId: playlistId
                    }
                }
            } as any);
        }

    };
}

export function fetchTracks(ids: Array<number>): ThunkResult<void> {
    return (dispatch) => {
        if (!ids || (ids && !ids.length)) return;

        return dispatch({
            type: ObjectsActionTypes.SET_TRACKS,
            payload: {
                promise: fetchToJson(SC.getTracks(ids))
                    .then((tracks) => {

                        const normalized = normalize(tracks, new schema.Array({
                            tracks: trackSchema
                        }, (input) => `${input.kind}s`));

                        return {
                            entities: normalized.entities
                        };
                    }),
                data: {
                    entities: {
                        trackEntities: ids.reduce((obj, id) => ({
                            ...obj,
                            [id]: {
                                loading: true
                            }
                        }), {})
                    }
                }
            }
        });

    };
}

export const unset = (objectId: string) => action(ObjectsActionTypes.UNSET, {
    objectId,
    objectType: ObjectTypes.PLAYLISTS
});
