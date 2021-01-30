import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const getUi = (state: StoreState) => state.ui;

export const getSearchQuerySelector = createSelector(getUi, (state) => state.searchQuery);
export const getToastsSelector = createSelector(getUi, (state) => state.toasts);
