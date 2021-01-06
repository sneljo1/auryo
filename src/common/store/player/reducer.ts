import { pick } from 'lodash';
import { createReducer } from 'typesafe-actions';
import { playTrack, resetStore, restartTrack, setCurrentPlaylist, setCurrentTime, toggleStatus } from '../actions';
import { PlayerState, PlayerStatus } from '../types';
import { addUpNext, clearUpNext, queueInsert, removeFromUpNext, setCurrentIndex } from './actions';

const initialState: PlayerState = {
  status: PlayerStatus.STOPPED,
  currentPlaylistId: null,
  playingTrack: null,
  currentTime: 0,
  duration: 0,
  currentIndex: 0,
  upNext: []
};

export const playerReducer = createReducer<PlayerState>(initialState)
  .handleAction(setCurrentPlaylist.success, (state, action) => {
    const { payload } = action;
    return {
      ...state,
      currentPlaylistId: payload.playlistId
    };
  })
  .handleAction(playTrack.success, (state, { payload }) => {
    const { idResult, origin, parentPlaylistID, duration = 0, position, positionInPlaylist } = payload;

    return {
      ...state,
      playingTrack: {
        ...pick(idResult, ['id', 'un']),
        playlistId: origin,
        parentPlaylistID
      },
      status: PlayerStatus.PLAYING,
      duration,
      currentTime: 0,
      currentIndex: position,
      currentIndexInPlaylist: positionInPlaylist != null ? positionInPlaylist : undefined
    };
  })
  .handleAction(toggleStatus, (state, action) => {
    const { payload } = action;

    let status = payload;

    if (!status) {
      status = state.status === PlayerStatus.PLAYING ? PlayerStatus.PAUSED : PlayerStatus.PLAYING;
    }

    return {
      ...state,
      status
    };
  })
  // TODO: do we still need this?
  // .handleAction(setDuration, (state, action) => {
  //   const { payload } = action;

  //   return {
  //     ...state,
  //     duration: payload
  //   };
  // })
  .handleAction(setCurrentTime, (state, action) => {
    const { payload } = action;

    return {
      ...state,
      currentTime: payload
    };
  })
  .handleAction(restartTrack, state => {
    return {
      ...state,
      currentTime: 0
    };
  })
  .handleAction(addUpNext.success, (state, action) => {
    const {
      payload: { items = [] }
    } = action;

    return {
      ...state,
      upNext: [...state.upNext, ...items.map(item => ({ ...item, un: Date.now() }))]
    };
  })
  // Remove first item as it is inserted into the queue
  .handleAction(queueInsert, (state, { payload }) => {
    const { upNext: newUpNext } = state;

    newUpNext.splice(0, payload.items.length);

    return {
      ...state,
      upNext: [...newUpNext]
    };
  })
  .handleAction(setCurrentIndex, (state, { payload }) => {
    const { position } = payload;
    return {
      ...state,
      currentIndex: position
    };
  })
  .handleAction(clearUpNext, state => {
    return {
      ...state,
      upNext: []
    };
  })
  .handleAction(removeFromUpNext, (state, { payload }) => {
    const { upNext: newUpNext } = state;

    newUpNext.splice(payload, 1);

    return {
      ...state,
      upNext: [...newUpNext]
    };
  })
  .handleAction(resetStore, () => {
    return initialState;
  });
// tslint:disable-next-line: max-func-body-length cyclomatic-complexity
// export const playerReducer: Reducer<PlayerState> = (state = initialState, action) => {
//   const { payload, type } = action;

//   switch (type) {
//     case PlayerActionTypes.SET_TRACK:
//       // eslint-disable-next-line no-case-declarations
//       const position = _.findIndex(state.queue, payload.nextTrack);

//       // eslint-disable-next-line no-case-declarations
//       const newState = {
//         ...state,
//         playingTrack: payload.nextTrack,
//         status: payload.status,
//         currentTime: 0,
//         currentIndex: payload.position
//       };

//       if (!payload.repeat) {
//         newState.duration = 0;
//       }

//       if (position === state.upNext.start) {
//         newState.upNext = {
//           start: state.upNext.length >= 1 ? state.upNext.start + 1 : 0,
//           length: state.upNext.length >= 1 ? state.upNext.length - 1 : 0
//         };
//       }

//       return newState;
//     case PlayerActionTypes.SET_TIME:
//       return {
//         ...state,
//         currentTime: payload.time
//       };
//     case PlayerActionTypes.UPDATE_TIME:
//       return {
//         ...state,
//         currentTime: payload.time >= 0 && payload.time < state.duration ? payload.time : state.currentTime
//       };
//     case PlayerActionTypes.SET_DURATION:
//       return {
//         ...state,
//         duration: payload.time
//       };
//     case PlayerActionTypes.TOGGLE_PLAYING:
//       if (payload.status === PlayerStatus.STOPPED) {
//         return {
//           ...state,
//           status: payload.status,
//           playingTrack: null,
//           currentTime: 0,
//           duration: 0,
//           currentPlaylistId: null
//         };
//       }

//       return {
//         ...state,
//         status: payload.status
//       };
//     case onSuccess(PlayerActionTypes.SET_PLAYLIST):
//     case PlayerActionTypes.SET_PLAYLIST:
//       // eslint-disable-next-line no-case-declarations
//       const nextTrackPosition = _.findIndex(payload.items, payload.nextTrack);

//       if (nextTrackPosition !== -1 && state.upNext.length > 0) {
//         return {
//           ...state,
//           currentPlaylistId: payload.playlistId,
//           queue: [
//             ...payload.items.slice(0, nextTrackPosition + 1),
//             ...state.queue.slice(state.upNext.start, state.upNext.start + state.upNext.length),
//             ...payload.items.slice(nextTrackPosition + 1)
//           ],
//           originalQueue: payload.originalItems,
//           upNext: {
//             ...state.upNext,
//             start: nextTrackPosition + 1
//           }
//         };
//       }

//       return {
//         ...state,
//         currentPlaylistId: payload.playlistId,
//         queue: payload.items,
//         originalQueue: payload.originalItems,
//         containsPlaylists: payload.containsPlaylists
//       };
//     case onSuccess(PlayerActionTypes.QUEUE_INSERT):
//     case PlayerActionTypes.QUEUE_INSERT:
//       return {
//         ...state,
//         queue: [
//           ...state.queue.slice(0, payload.index),
//           ...payload.items,
//           ...state.queue.slice((payload.index as number) + 1)
//         ],
//         originalQueue: [...state.originalQueue, ...payload.items]
//       };
//     case PlayerActionTypes.ADD_UP_NEXT:
//       if (!_.isNil(payload.remove)) {
//         const removeInUpNext =
//           payload.remove > state.upNext.start && payload.remove < state.upNext.start + state.upNext.length;

//         // eslint-disable-next-line no-shadow
//         const newState = {
//           ...state,
//           queue: [...state.queue.slice(0, payload.remove), ...state.queue.slice((payload.remove as number) + 1)],
//           upNext: {
//             start: payload.remove < state.upNext.start ? state.upNext.start - 1 : state.upNext.start,
//             length: removeInUpNext ? state.upNext.length - 1 : state.upNext.length
//           }
//         };

//         if (payload.remove === newState.upNext.start) {
//           newState.upNext.length = newState.upNext.length >= 1 ? newState.upNext.length - 1 : 0;
//         }

//         return newState;
//       }

//       if (state.upNext.length !== 0) {
//         return {
//           ...state,
//           queue: [
//             ...state.queue.slice(0, state.upNext.start + state.upNext.length),
//             ...payload.next,
//             ...state.queue.slice(state.upNext.start + state.upNext.length)
//           ],
//           upNext: {
//             start: state.upNext.start,
//             length: state.upNext.length + (payload.next.length as number)
//           }
//         };
//       }

//       return {
//         ...state,
//         queue: [
//           ...state.queue.slice(0, (payload.position as number) + 1),
//           ...payload.next,
//           ...state.queue.slice((payload.position as number) + 1)
//         ],
//         upNext: {
//           start: (payload.position as number) + 1,
//           length: state.upNext.length + (payload.next.length as number)
//         }
//       };

//     case PlayerActionTypes.TOGGLE_SHUFFLE:
//       if (payload.value) {
//         const before = state.queue.slice(0, state.currentIndex + 1);
//         const after = state.queue.slice(state.currentIndex + 1);

//         const items = _.shuffle(after);

//         return {
//           ...state,
//           queue: [...before, ...items]
//         };
//       }

//       // eslint-disable-next-line no-case-declarations
//       const after = state.originalQueue.slice(state.currentIndex + 1);

//       return {
//         ...state,
//         queue: [...state.queue.slice(0, state.currentIndex + 1), ...after]
//       };

//     case PlayerActionTypes.CLEAR_UP_NEXT:
//       return {
//         ...state,
//         queue: [
//           ...state.queue.slice(0, state.upNext.start),
//           ...state.queue.slice(state.upNext.start + state.upNext.length)
//         ],
//         upNext: {
//           start: 0,
//           length: 0
//         }
//       };
//     case ObjectsActionTypes.UNSET_TRACK:
//       return {
//         ...state,
//         queue: [...state.queue.slice(0, payload.position), ...state.queue.slice((payload.position as number) + 1)]
//       };
//     case AppActionTypes.RESET_STORE:
//       return initialState;
//     default:
//       return state;
//   }
// };
