import { ObjectStateItem } from '@common/store/objects/types';
import { ChangeTypes, PlayerActionTypes, PlayerStatus } from '@common/store/player/types';
import { PlaylistIdentifier } from '@common/store/playlist/types';
import { wError, wSuccess } from '@common/utils/reduxUtils';
import { Normalized } from '@types';
import { createAction, createAsyncAction } from 'typesafe-actions';

export const seekTo = createAction(PlayerActionTypes.SEEK_TO)<number>();
export const toggleShuffle = createAction(PlayerActionTypes.TOGGLE_SHUFFLE)<boolean>();
export const toggleStatus = createAction(PlayerActionTypes.TOGGLE_STATUS, (status?: PlayerStatus) => status)();
export const playlistFinished = createAction(PlayerActionTypes.PLAYLIST_FINISHED)();
export const restartTrack = createAction(PlayerActionTypes.RESTART_TRACK)();
export const trackFinished = createAction(PlayerActionTypes.TRACK_FINISHED)();
export const startPlayMusicIndex = createAction(PlayerActionTypes.START_PLAY_MUSIC_INDEX)<{
  index: number;
  changeType?: ChangeTypes;
}>();

export const changeTrack = createAction(PlayerActionTypes.CHANGE_TRACK, (changeType: ChangeTypes) => ({
  changeType
}))();

export const setCurrentTime = createAction(PlayerActionTypes.SET_TIME)<number>();

export const startPlayMusic = createAction(PlayerActionTypes.START_PLAY_MUSIC)<{
  idResult?: ObjectStateItem;
  origin?: PlaylistIdentifier;
  changeType?: ChangeTypes;
  nextPosition?: number;
}>();

export const playTrackFromQueue = createAction(PlayerActionTypes.PLAY_TRACK_FROM_QUEUE)<{
  idResult: ObjectStateItem;
  index: number;
}>();

interface PlayTrackProps {
  idResult: ObjectStateItem;
  origin: PlaylistIdentifier;
  nextPosition?: number;
}

export const playTrack = createAsyncAction(
  String(PlayerActionTypes.PLAY_TRACK),
  wSuccess(PlayerActionTypes.PLAY_TRACK),
  wError(PlayerActionTypes.PLAY_TRACK)
)<
  PlayTrackProps,
  PlayTrackProps & {
    duration: number;
    position: number;
    positionInPlaylist?: number;
    parentPlaylistID?: PlaylistIdentifier;
  },
  object
>();

interface PlayPlaylistProps {
  idResult: ObjectStateItem;
  origin: PlaylistIdentifier;
  changeType?: ChangeTypes;
  nextPosition?: number;
}

export const playPlaylist = createAction(PlayerActionTypes.PLAY_PLAYLIST)<PlayPlaylistProps>();

export const setCurrentPlaylist = createAsyncAction(
  String(PlayerActionTypes.SET_CURRENT_PLAYLIST),
  wSuccess(PlayerActionTypes.SET_CURRENT_PLAYLIST),
  wError(PlayerActionTypes.SET_CURRENT_PLAYLIST)
)<{ playlistId: PlaylistIdentifier }, { playlistId: PlaylistIdentifier; items: ObjectStateItem[] }, object>();
export const setCurrentIndex = createAction(PlayerActionTypes.SET_CURRENT_INDEX)<{
  position: number;
}>();
export const resolvePlaylistItems = createAction(PlayerActionTypes.RESOLVE_PLAYLIST_ITEMS)<{
  items: ObjectStateItem[];
  playlistItem: ObjectStateItem;
}>();
export const addUpNext = createAsyncAction(
  String(PlayerActionTypes.ADD_UP_NEXT),
  wSuccess(PlayerActionTypes.ADD_UP_NEXT),
  wError(PlayerActionTypes.ADD_UP_NEXT)
)<Normalized.NormalizedResult, { items: ObjectStateItem[] }, object>();

export const queueInsert = createAction(PlayerActionTypes.QUEUE_INSERT)<{
  items: ObjectStateItem[];
  position: number;
}>();
export const shuffleQueue = createAction(PlayerActionTypes.SHUFFLE_QUEUE)<{
  fromIndex: number;
}>();
export const setQueue = createAction(PlayerActionTypes.SET_QUEUE)<{
  items: Normalized.NormalizedResult[];
}>();
export const clearUpNext = createAction(PlayerActionTypes.CLEAR_UP_NEXT)();
export const removeFromQueue = createAction(PlayerActionTypes.REMOVE_FROM_QUEUE)<number>();
export const removeFromUpNext = createAction(PlayerActionTypes.REMOVE_FROM_UP_NEXT)<number>();
export const removeFromQueueOrUpNext = createAction(PlayerActionTypes.REMOVE_FROM_QUEUE_OR_UP_NEXT)<number>();
