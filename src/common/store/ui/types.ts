import { IToastOptions } from '@blueprintjs/core';

// TYPES
export type UIState = Readonly<{
  toasts: IToastOptions[];
  // TODO: can this be removed?
  // dimensions: Dimensions;
  searchQuery?: string;
}>;

export interface Dimensions {
  width: number;
  height: number;
}

// ACTIONS
export enum UIActionTypes {
  ADD_TOAST = 'auryo.ui.ADD_TOAST',
  REMOVE_TOAST = '@@auryo.ui.REMOVE_TOAST',
  CLEAR_TOASTS = '@@auryo.ui.CLEAR_TOASTS',
  SET_DIMENSIONS = '@@auryo.ui.SET_DIMENSIONS',
  SET_SEARCH_QUERY = '@@auryo.ui.SET_SEARCH_QUERY'
}
