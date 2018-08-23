import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import { actionTypes, OBJECT_TYPES, PLAYLISTS } from '../constants';
import { isLoading, onError, onSuccess } from '../utils/reduxUtils';

const initialObjectsState = {
    isFetching: false,
    error: null,
    meta: {},
    items: [],
    futureUrl: false,
    nextUrl: false,
    fetchedItems: 0

}

function objects(state = initialObjectsState, action) {
    const { type, payload } = action

    let new_items;
    let result;
    let items;

    switch (type) {
        case isLoading(actionTypes.OBJECT_SET):
            return {
                ...state,
                isFetching: true,
                nextUrl: null
            }
        case onError(actionTypes.OBJECT_SET):
            return {
                ...state,
                isFetching: false,
                error: payload
            }
        case isLoading(actionTypes.OBJECT_SET_TRACKS):
            return {
                ...state,
                isFetching: true
            }
        case actionTypes.OBJECT_UNSET:
            return initialObjectsState
        case actionTypes.OBJECT_SET:
        case onSuccess(actionTypes.OBJECT_SET):

            result = payload.result || []
            items = state.items || []

            if (payload.refresh) {
                new_items = uniqWith([...result], isEqual)
            } else {
                new_items = uniqWith([...items, ...result], isEqual)
            }
            return {
                ...state,
                isFetching: false,
                meta: payload.meta || {},
                items: new_items,
                futureUrl: payload.futureUrl,
                nextUrl: payload.nextUrl,
                fetchedItems: payload.fetchedItems
            }
        case onSuccess(actionTypes.OBJECT_UPDATE_ITEMS):
            return {
                ...state,
                items: [...payload.items]
            }
        case onSuccess(actionTypes.OBJECT_SET_TRACKS):
            return {
                ...state,
                isFetching: false,
                fetchedItems: state.fetchedItems + payload.fetchedItems
            }
        case onSuccess(actionTypes.AUTH_SET_NEW_FEED_ITEMS):
            return {
                ...state,
                futureUrl: payload.futureUrl
            }
        case onSuccess(actionTypes.AUTH_SET_LIKE):
            if (payload.liked) {
                return {
                    ...state,
                    // because of the denormalization process, every item needs a schema
                    items: [{ id: payload.trackId, schema: 'tracks' }, ...state.items]
                }
            }
            return {
                ...state,
                items: state.items.filter((item) => payload.trackId !== item.id)
            }
        default:
            break;

    }
    return state
}

const initialObjectGroupState = {}

function objectgroup(state = initialObjectGroupState, action) {
    const { type, payload } = action

    const playlistName = payload.playlist ? PLAYLISTS.PLAYLISTS : PLAYLISTS.LIKES

    switch (type) {
        case isLoading(actionTypes.OBJECT_SET):
        case onSuccess(actionTypes.OBJECT_SET):
        case onSuccess(actionTypes.OBJECT_UPDATE_ITEMS):
        case onError(actionTypes.OBJECT_SET):
        case actionTypes.OBJECT_SET:
        case actionTypes.OBJECT_UNSET:
        case onSuccess(actionTypes.AUTH_SET_NEW_FEED_ITEMS):
        case onSuccess(actionTypes.OBJECT_SET_TRACKS):
        case isLoading(actionTypes.OBJECT_SET_TRACKS):
            return {
                ...state,
                [payload.object_id]: objects(state[payload.object_id], action)
            }
        case onSuccess(actionTypes.AUTH_SET_LIKE):
            return {
                ...state,
                [playlistName]: objects(state[playlistName], action)
            }
        default:
            break;

    }
    return state
}


const initialState = {
    [OBJECT_TYPES.PLAYLISTS]: {},
    [OBJECT_TYPES.COMMENTS]: {}
}

export default function objectsgroups(state = initialState, action) {
    const { type, payload } = action

    switch (type) {
        case isLoading(actionTypes.OBJECT_SET):
        case onSuccess(actionTypes.OBJECT_SET):
        case onSuccess(actionTypes.OBJECT_UPDATE_ITEMS):
        case onError(actionTypes.OBJECT_SET):
        case actionTypes.OBJECT_SET:
        case actionTypes.OBJECT_UNSET:
        case onSuccess(actionTypes.AUTH_SET_NEW_FEED_ITEMS):
            return {
                ...state,
                [payload.object_type]: objectgroup(state[payload.object_type], action)
            }
        case onSuccess(actionTypes.AUTH_SET_LIKE):
        case onSuccess(actionTypes.OBJECT_SET_TRACKS):
        case isLoading(actionTypes.OBJECT_SET_TRACKS):
            return {
                ...state,
                [OBJECT_TYPES.PLAYLISTS]: objectgroup(state[OBJECT_TYPES.PLAYLISTS], action)
            }
        case actionTypes.APP_RESET_STORE:
            return initialState
        default:
            return state
    }
}
