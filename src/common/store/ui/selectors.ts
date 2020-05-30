import { StoreState } from 'AppReduxTypes';
import { UIState } from '../types';
import { createSelector } from 'reselect';

export const getUi = (state: StoreState) => state.ui;

export const getSearchQuery = createSelector(getUi, (state: UIState) => state.searchQuery);
