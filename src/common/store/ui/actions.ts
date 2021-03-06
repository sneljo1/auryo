import { wDebounce } from '@common/utils/reduxUtils';
import { actions as toasterActions, AddToastPayload } from 'react-redux-toastr';
import { createAction } from 'typesafe-actions';
import { UIActionTypes } from './types';

// Toasts
export const addErrorToast = (data: Omit<AddToastPayload, 'id' | 'type'>) =>
  toasterActions.add({
    id: Date.now().toString(),
    type: 'error',
    ...data
  });

export const addSuccessToast = (data: Omit<AddToastPayload, 'id' | 'type'>) =>
  toasterActions.add({
    id: Date.now().toString(),
    type: 'success',
    ...data
  });

export const addInfoToast = (data: Omit<AddToastPayload, 'id' | 'type'>) =>
  toasterActions.add({
    id: Date.now().toString(),
    type: 'info',
    ...data
  });

// Search
export const setSearchQuery = createAction(UIActionTypes.SET_SEARCH_QUERY)<{ query: string; noNavigation?: boolean }>();
export const setDebouncedSearchQuery = createAction(wDebounce(UIActionTypes.SET_SEARCH_QUERY))<string>();
