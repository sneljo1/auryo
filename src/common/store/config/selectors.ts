import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const configSelector = (state: StoreState) => state.config;

export const authTokenStateSelector = createSelector([configSelector], config => config.auth);
export const shuffleSelector = createSelector([configSelector], config => config.shuffle);
