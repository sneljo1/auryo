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
  .handleAction(restartTrack, (state) => {
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
      upNext: [...state.upNext, ...items.map((item) => ({ ...item, un: Date.now() }))]
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
  .handleAction(clearUpNext, (state) => {
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
