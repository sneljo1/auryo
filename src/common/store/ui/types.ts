import { IToastOptions } from '@blueprintjs/core';

// TYPES
export type UIState = Readonly<{
  toasts: IToastOptions[];
  dimensions: Dimensions;
  searchQuery?: string;
}>;

export interface Dimensions {
  width: number;
  height: number;
}

// ACTIONS
export enum UIActionTypes {
  ADD_TOAST = '@@ui/ADD_TOAST',
  REMOVE_TOAST = '@@ui/REMOVE_TOAST',
  CLEAR_TOASTS = '@@ui/CLEAR_TOASTS',
  SET_DIMENSIONS = '@@ui/SET_DIMENSIONS',
  SET_SEARCH_QUERY = '@@ui/SET_SEARCH_QUERY'
}
