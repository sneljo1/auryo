import { IToastOptions } from '@blueprintjs/core';
import { createAction } from 'typesafe-actions';
import { UIActionTypes, Dimensions } from './types';
import { wDebounce } from '@common/utils/reduxUtils';

// Toasts
export const addToast = createAction<UIActionTypes.ADD_TOAST>(UIActionTypes.ADD_TOAST)<IToastOptions>();
export const removeToast = createAction(UIActionTypes.REMOVE_TOAST)<string>();
export const clearToasts = createAction(UIActionTypes.CLEAR_TOASTS)();

// Dimensions
export const setDimensions = createAction(UIActionTypes.SET_DIMENSIONS)<Dimensions>();
export const setDebouncedDimensions = createAction(wDebounce(UIActionTypes.SET_DIMENSIONS))<Dimensions>();

// Search
export const setSearchQuery = createAction(UIActionTypes.SET_SEARCH_QUERY)<{ query: string; noNavigation?: boolean }>();
export const setDebouncedSearchQuery = createAction(wDebounce(UIActionTypes.SET_SEARCH_QUERY))<string>();
