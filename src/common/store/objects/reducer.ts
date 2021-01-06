import { Normalized } from '@types';
import _, { isEqual, pick, uniqWith } from 'lodash';
import { createReducer } from 'typesafe-actions';
import {
  commentsFetchMore,
  genericPlaylistFetchMore,
  getComments,
  getForYouSelection,
  getGenericPlaylist,
  getSearchPlaylist,
  queueInsert,
  removeFromQueue,
  resolvePlaylistItems,
  setCommentsLoading,
  setCurrentPlaylist,
  setPlaylistLoading,
  shuffleQueue
} from '../actions';
import { ObjectGroup, ObjectsState, ObjectState, ObjectTypes, PlaylistTypes } from '../types';

const initialObjectsState: ObjectState = {
  isFetching: false,
  error: null,
  items: [],
  fetchedItems: 0,
  itemsToFetch: [],
  meta: {}
};

const objectState = createReducer<ObjectState>(initialObjectsState)
  .handleAction([getGenericPlaylist.request, setPlaylistLoading, getComments.request, setCommentsLoading], state => {
    return {
      ...state,
      isFetching: true,
      error: null
    };
  })
  .handleAction(getSearchPlaylist, (state, action) => {
    const { query, tag } = action.payload;

    const isFetching = !!(query && query.length) || !!tag;

    return {
      ...state,
      isFetching,
      items: [],
      error: null,
      meta: { query }
    };
  })
  .handleAction(getGenericPlaylist.success, (state, action) => {
    const { payload } = action;

    let itemsToAdd = payload.result;
    let itemsToFetch: Normalized.NormalizedResult[] = [];

    if (payload.fetchedItemsIds) {
      itemsToAdd = itemsToAdd.filter(i => payload.fetchedItemsIds?.includes(i.id));

      if (payload.result.length !== itemsToAdd.length) {
        // Filter out difference between arrays
        itemsToFetch = [payload.result, itemsToAdd].reduce((a, b) =>
          a.filter(c => !b.map(({ id }) => id).includes(c.id))
        );
      }
    }

    // If related playlist, also include the song which it relates to
    if (payload.playlistType === PlaylistTypes.RELATED && payload.objectId) {
      itemsToAdd.unshift({ id: +payload.objectId, schema: 'tracks' });
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
  .handleAction(genericPlaylistFetchMore.success, (state, { payload }) => {
    const { result = [], fetchedItemsIds = [] } = payload;

    const itemsToFetch = state.itemsToFetch.filter(a => !fetchedItemsIds.includes(a.id));

    return {
      ...state,
      isFetching: false,
      items: uniqWith([...state.items, ...result], isEqual),
      nextUrl: payload.nextUrl,
      itemsToFetch,
      meta: { ...state.meta, updatedAt: Date.now() }
    };
  })
  .handleAction(getComments.success, (state, action) => {
    const { payload } = action;

    const itemsToAdd = payload.result;

    const items = payload.refresh ? itemsToAdd : uniqWith([...state.items, ...itemsToAdd], isEqual);

    return {
      ...state,
      isFetching: false,
      items,
      nextUrl: payload.nextUrl,
      meta: { createdAt: Date.now() }
    };
  })
  .handleAction(commentsFetchMore.success, (state, action) => {
    const { payload } = action;

    return {
      ...state,
      isFetching: false,
      items: uniqWith([...state.items, ...payload.result], isEqual),
      nextUrl: payload.nextUrl,
      meta: { ...state.meta, updatedAt: Date.now() }
    };
  })
  .handleAction(
    [getGenericPlaylist.failure, genericPlaylistFetchMore.failure, getComments.failure, commentsFetchMore.failure],
    (state, action) => {
      const { payload } = action;

      return {
        ...state,
        isFetching: false,
        error: payload.error
      };
    }
  );
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
  .handleAction(
    [
      getComments.request,
      getComments.success,
      getComments.failure,
      commentsFetchMore.request,
      commentsFetchMore.success,
      commentsFetchMore.failure,
      setCommentsLoading
    ],
    (state, action) => {
      const trackId = action.payload?.trackId;

      if (!trackId) {
        return state;
      }

      return {
        ...state,
        [trackId]: objectState(state[trackId], action)
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
  [PlaylistTypes.PLAYLIST]: initialObjectGroupState,
  [PlaylistTypes.SEARCH]: initialObjectsState,
  [PlaylistTypes.SEARCH_PLAYLIST]: initialObjectsState,
  [PlaylistTypes.SEARCH_TRACK]: initialObjectsState,
  [PlaylistTypes.SEARCH_USER]: initialObjectsState,
  [PlaylistTypes.QUEUE]: initialObjectsState,
  [PlaylistTypes.RELATED]: initialObjectGroupState,

  [ObjectTypes.PLAYLISTS]: {},
  [ObjectTypes.COMMENTS]: {}
};

export const objectsReducer = createReducer<ObjectsState>(initialState)
  .handleAction(
    [
      getGenericPlaylist.request,
      getGenericPlaylist.failure,
      setPlaylistLoading,
      genericPlaylistFetchMore.request,
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
  .handleAction(
    [
      getComments.request,
      getComments.success,
      getComments.failure,
      commentsFetchMore.request,
      commentsFetchMore.success,
      commentsFetchMore.failure,
      setCommentsLoading
    ],
    (state, action) => {
      return {
        ...state,
        [ObjectTypes.COMMENTS]: objectGroup(state[ObjectTypes.COMMENTS], action)
      };
    }
  )
  .handleAction(getForYouSelection.success, (state, action) => {
    return {
      ...state,
      [PlaylistTypes.PLAYLIST]: objectGroup(state[PlaylistTypes.PLAYLIST], action)
    };
  })

  // Managing QUEUE state
  .handleAction([getGenericPlaylist.success], (state, action) => {
    const { playlistType, objectId } = action.payload;
    const queuePlaylist = state[PlaylistTypes.QUEUE];

    const newPlaylistState = objectId
      ? objectGroup(state[playlistType], action)
      : objectState(state[playlistType], action);

    const newState: Partial<ObjectState> = {
      [playlistType]: newPlaylistState
    };
    // const isPlaylist = objectId && playlistType === PlaylistTypes.PLAYLIST;
    // const unResolvedPlaylistIndices = objectId
    //   ? _.keys(_.pickBy(queuePlaylist.items, { schema: 'playlists', id: +objectId }))
    //   : [];

    // if (isPlaylist && unResolvedPlaylistIndices.length) {
    //   const items = [...queuePlaylist.items];

    //   unResolvedPlaylistIndices.forEach(index => items.splice(+index, 1, ...(newPlaylistState as ObjectState).items));
    // }

    return {
      ...state,
      ...newState
    };
  })
  .handleAction([genericPlaylistFetchMore.success], (state, action) => {
    const { playlistType, objectId, shuffle, result } = action.payload;
    const queuePlaylist = state[PlaylistTypes.QUEUE];
    const { originalPlaylistID } = queuePlaylist.meta;

    const newPlaylistState = objectId
      ? objectGroup(state[playlistType], action)
      : objectState(state[playlistType], action);

    const newState: Partial<ObjectState> = {
      [playlistType]: newPlaylistState
    };

    const isCurrentPlaylistSameAsQueue = isEqual(originalPlaylistID, {
      playlistType,
      objectId
    });

    if (isCurrentPlaylistSameAsQueue) {
      newState[PlaylistTypes.QUEUE] = {
        ...queuePlaylist,
        ...pick(newPlaylistState, ['fetchedItems', 'nextUrl', 'itemsToFetch'])
      };

      // if (shuffle) {
      newState[PlaylistTypes.QUEUE].items = [...newState[PlaylistTypes.QUEUE].items, ...result];
      // }
    }

    return {
      ...state,
      ...newState
    };
  })
  .handleAction(setCurrentPlaylist.success, (state, action) => {
    const {
      playlistId: { playlistType, objectId },
      items
    } = action.payload;

    let queueObjectState: ObjectState = state[playlistType];

    if (objectId) {
      queueObjectState = state[playlistType]?.[objectId] ?? initialObjectsState;
    }

    return {
      ...state,
      [PlaylistTypes.QUEUE]: {
        ...queueObjectState,
        items,
        meta: {
          ...queueObjectState.meta,
          originalPlaylistID: { playlistType, objectId }
        }
      }
    };
  })
  .handleAction(queueInsert, (state, action) => {
    const { items, position } = action.payload;

    const queuePlaylist = state[PlaylistTypes.QUEUE];
    const newItems = [...queuePlaylist.items];

    newItems.splice(position, 0, ...items);

    return {
      ...state,
      [PlaylistTypes.QUEUE]: {
        ...queuePlaylist,
        items: newItems
      }
    };
  })
  .handleAction(removeFromQueue, (state, { payload: indexToRemove }) => {
    const queuePlaylist = state[PlaylistTypes.QUEUE];
    const newItems = [...queuePlaylist.items];

    newItems.splice(indexToRemove, 1);

    return {
      ...state,
      [PlaylistTypes.QUEUE]: {
        ...queuePlaylist,
        items: newItems
      }
    };
  })
  .handleAction(resolvePlaylistItems, (state, action) => {
    const { items, playlistItem } = action.payload;

    const queuePlaylist = state[PlaylistTypes.QUEUE];
    const newItems = [...queuePlaylist.items];

    const indexToReplace = _.findIndex(newItems, item => _.isEqual(item, playlistItem));

    if (indexToReplace === -1) {
      return state;
    }

    newItems.splice(indexToReplace, 1, ...items);

    return {
      ...state,
      [PlaylistTypes.QUEUE]: {
        ...queuePlaylist,
        items: newItems
      }
    };
  })
  .handleAction(shuffleQueue, (state, { payload }) => {
    const { fromIndex } = payload;

    const queuePlaylist = state[PlaylistTypes.QUEUE];
    const items = [...queuePlaylist.items];

    return {
      ...state,
      [PlaylistTypes.QUEUE]: {
        ...queuePlaylist,
        items: items.slice(0, fromIndex).concat(_.shuffle(items.slice(fromIndex, items.length)))
      }
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
