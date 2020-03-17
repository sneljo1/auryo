import { NormalizedResult } from 'src/types/normalized';
import { createReducer } from 'typesafe-actions';
import {
  genericPlaylistFetchMore,
  getGenericPlaylist,
  getSearchPlaylist,
  setPlaylistLoading,
  getForYouSelection
} from '../playlist/actions';
import { ObjectGroup, ObjectsState, ObjectState, ObjectTypes, PlaylistTypes } from './types';
import { uniqWith, isEqual } from 'lodash';

const initialObjectsState: ObjectState = {
  isFetching: false,
  error: null,
  items: [],
  fetchedItems: 0,
  itemsToFetch: [],
  meta: {}
};

const objectState = createReducer<ObjectState>(initialObjectsState)
  .handleAction([getGenericPlaylist.request, setPlaylistLoading], state => {
    return {
      ...state,
      isFetching: true,
      error: null
    };
  })
  .handleAction(getSearchPlaylist, (state, action) => {
    const { query, tag } = action.payload;
    return {
      ...state,
      isFetching: (query && query.length) || !!tag,
      items: [],
      error: null,
      meta: { query }
    };
  })
  .handleAction(getGenericPlaylist.success, (state, action) => {
    const { payload } = action;

    let itemsToAdd = payload.result;
    let itemsToFetch: NormalizedResult[] = [];

    if (payload.fetchedItemsIds) {
      itemsToAdd = itemsToAdd.filter(i => payload.fetchedItemsIds?.includes(i.id));

      if (payload.result.length !== itemsToAdd.length) {
        // Filter out difference between arrays
        itemsToFetch = [payload.result, itemsToAdd].reduce((a, b) =>
          a.filter(c => !b.map(({ id }) => id).includes(c.id))
        );
      }
    }

    const items = payload.refresh ? itemsToAdd : uniqWith([...state.items, ...itemsToAdd], isEqual);

    return {
      ...state,
      isFetching: false,
      items,
      nextUrl: payload.nextUrl,
      itemsToFetch,
      meta: { query: payload.query, createdAt: Date.now() }
    };
  })
  .handleAction(getGenericPlaylist.failure, (state, action) => {
    const { payload } = action;

    return {
      ...state,
      isFetching: false,
      error: payload.error
    };
  })
  .handleAction(genericPlaylistFetchMore.success, (state, action) => {
    const { payload } = action;

    const itemsToFetch = state.itemsToFetch.filter(a => !payload.fetchedItemsIds?.includes(a.id));

    return {
      ...state,
      isFetching: false,
      items: uniqWith([...state.items, ...payload.result], isEqual),
      nextUrl: payload.nextUrl,
      itemsToFetch,
      meta: { ...state.meta, updatedAt: Date.now() }
    };
  })
  .handleAction(genericPlaylistFetchMore.failure, state => {
    return {
      ...state,
      isFetching: false
    };
  });
// const objectState: Reducer<ObjectState<any>> = (state = initialObjectsState, action) => {
//   const { type, payload } = action;

//   let newItems;
//   let result;
//   let items;

//   switch (type) {
//     case isLoading(ObjectsActionTypes.SET):
//       return {
//         ...state,
//         isFetching: true,
//         nextUrl: null
//       };
//     case onError(ObjectsActionTypes.SET):
//       return {
//         ...state,
//         isFetching: false,
//         error: payload
//       };
//     case isLoading(ObjectsActionTypes.SET_TRACKS):
//       return {
//         ...state,
//         isFetching: true
//       };
//     case ObjectsActionTypes.SET:
//     case onSuccess(ObjectsActionTypes.SET):
//       result = payload.result || [];
//       items = state.items || [];

//       newItems = _.uniqWith([...(payload.refresh ? [] : items), ...result], _.isEqual);

//       return {
//         ...state,
//         isFetching: false,
//         meta: payload.meta || {},
//         items: newItems,
//         futureUrl: payload.futureUrl,
//         nextUrl: payload.nextUrl,
//         fetchedItems: payload.fetchedItems
//       };
//     case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
//       return {
//         ...state,
//         items: [...payload.items]
//       };
//     case onSuccess(ObjectsActionTypes.SET_TRACKS):
//       // eslint-disable-next-line no-case-declarations
//       const unableToFetch = _.difference(
//         payload.shouldFetchedIds.map((t: Normalized.NormalizedResult) => t.id),
//         payload.fetchedIds.map((t: Normalized.NormalizedResult) => t.id)
//       );

//       // eslint-disable-next-line no-case-declarations
//       const filtered = state.items.filter(t => unableToFetch.indexOf(t.id) === -1);

//       return {
//         ...state,
//         isFetching: false,
//         items: [...filtered],
//         fetchedItems: state.fetchedItems + payload.fetchedIds.length
//       };
//     case onSuccess(AuthActionTypes.SET_LIKE):
//       if (payload.liked) {
//         return {
//           ...state,
//           // because of the denormalization process, every item needs a schema
//           items: [{ id: payload.trackId, schema: payload.playlist ? 'playlists' : 'tracks' }, ...state.items]
//         };
//       }

//       return {
//         ...state,
//         items: state.items.filter(item => payload.trackId !== item.id)
//       };
//     case ObjectsActionTypes.UNSET_TRACK:
//       return {
//         ...state,
//         items: state.items.filter(item => payload.trackId !== item.id)
//       };
//     case ObjectsActionTypes.UNSET:
//       return initialObjectsState;
//     default:
//   }

//   return state;
// };

const initialObjectGroupState: ObjectGroup = {};

const objectGroup = createReducer<ObjectGroup>(initialObjectGroupState)
  .handleAction(
    [
      getGenericPlaylist.request,
      getGenericPlaylist.success,
      getGenericPlaylist.failure,
      setPlaylistLoading,
      genericPlaylistFetchMore.request,
      genericPlaylistFetchMore.success,
      genericPlaylistFetchMore.failure,
      getSearchPlaylist
    ],
    (state, action) => {
      const playlistId = action.payload?.objectId || action.payload?.playlistType;

      if (!playlistId) {
        return state;
      }

      return {
        ...state,
        [playlistId]: objectState(state[playlistId], action)
      };
    }
  )
  .handleAction(getForYouSelection.success, (state, action) => {
    const { objects } = action.payload;

    const addObjects = {};

    for (let i = 0; i < objects.length; i += 1) {
      const object = objects[i];

      addObjects[object.objectId] = objectState(
        state[object.objectId],
        getGenericPlaylist.success({
          ...object,
          entities: {}
        })
      );
    }

    return {
      ...state,
      ...addObjects
    };
  });
// const objectGroup: Reducer<ObjectGroup> = (state = initialObjectGroupState, action) => {
//   const { type, payload } = action;

//   const playlistName = payload.playlist ? PlaylistTypes.PLAYLISTS : PlaylistTypes.LIKES;

//   switch (type) {
//     case isLoading(ObjectsActionTypes.SET):
//     case onSuccess(ObjectsActionTypes.SET):
//     case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
//     case onError(ObjectsActionTypes.SET):
//     case ObjectsActionTypes.SET:
//     case ObjectsActionTypes.UNSET:
//     case onSuccess(ObjectsActionTypes.SET_TRACKS):
//     case isLoading(ObjectsActionTypes.SET_TRACKS):
//     case ObjectsActionTypes.UNSET_TRACK:
//       if (!payload.objectId) {
//         return state;
//       }

//       return {
//         ...state,
//         [String(payload.objectId)]: objectState(state[String(payload.objectId)], action)
//       };
//     case onSuccess(AuthActionTypes.SET_LIKE):
//       if (!payload.playlist) {
//         return state;
//       }

//       return {
//         ...state,
//         [playlistName]: objectState(state[playlistName], action)
//       };
//     default:
//   }

//   return state;
// };

const initialState: ObjectsState = {
  [PlaylistTypes.STREAM]: initialObjectsState,
  [PlaylistTypes.LIKES]: initialObjectsState,
  [PlaylistTypes.MYTRACKS]: initialObjectsState,
  [PlaylistTypes.MYPLAYLISTS]: initialObjectsState,
  [PlaylistTypes.PLAYLIST]: initialObjectsState,
  [PlaylistTypes.SEARCH]: initialObjectsState,
  [PlaylistTypes.SEARCH_PLAYLIST]: initialObjectsState,
  [PlaylistTypes.SEARCH_TRACK]: initialObjectsState,
  [PlaylistTypes.SEARCH_USER]: initialObjectsState,

  [ObjectTypes.PLAYLISTS]: {},
  [ObjectTypes.COMMENTS]: {}
};

export const objectsReducer = createReducer<ObjectsState>(initialState)
  .handleAction(
    [
      getGenericPlaylist.request,
      getGenericPlaylist.success,
      getGenericPlaylist.failure,
      setPlaylistLoading,
      genericPlaylistFetchMore.request,
      genericPlaylistFetchMore.success,
      genericPlaylistFetchMore.failure,
      getSearchPlaylist
    ],
    (state, action) => {
      const { playlistType, objectId } = action.payload;
      return {
        ...state,
        [playlistType]: objectId ? objectGroup(state[playlistType], action) : objectState(state[playlistType], action)
      };
    }
  )
  .handleAction(getForYouSelection.success, (state, action) => {
    return {
      ...state,
      [PlaylistTypes.PLAYLIST]: objectGroup(state[PlaylistTypes.PLAYLIST], action)
    };
  });
//   const { type, payload } = action;

//   switch (type) {
//     case isLoading(ObjectsActionTypes.SET):
//     case onSuccess(ObjectsActionTypes.SET):
//     case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
//     case onError(ObjectsActionTypes.SET):
//     case ObjectsActionTypes.SET:
//     case ObjectsActionTypes.UNSET:
//       return {
//         ...state,
//         [payload.objectType]: objectGroup(state[payload.objectType], action)
//       };
//     case onSuccess(AuthActionTypes.SET_LIKE):
//     case onSuccess(ObjectsActionTypes.SET_TRACKS):
//     case isLoading(ObjectsActionTypes.SET_TRACKS):
//     case ObjectsActionTypes.UNSET_TRACK:
//       return {
//         ...state,
//         [ObjectTypes.PLAYLISTS]: objectGroup(state[ObjectTypes.PLAYLISTS], action)
//       };
//     case AppActionTypes.RESET_STORE:
//       return initialState;
//     default:
//       return state;
//   }
// };
