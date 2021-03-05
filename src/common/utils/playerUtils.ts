import { isEqual } from 'lodash';
import { ObjectStateItem, PlaylistIdentifier } from '../store/types';

export const isMatchingObjectState = (a: ObjectStateItem, b: ObjectStateItem) => a.id === b.id && a.un === b.un;

export const isMatchingObjectStateWithPlaylist = (a: ObjectStateItem, b: ObjectStateItem) => {
  return isEqual(b.parentPlaylistID, a.parentPlaylistID) && isMatchingObjectState(a, b);
};
export const isMatchingPlaylistID = (a: PlaylistIdentifier, b: PlaylistIdentifier) => {
  return isEqual(b, a);
};
