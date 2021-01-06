import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const configSelector = (state: StoreState) => state.config;

export const authTokenStateSelector = createSelector([configSelector], config => config.auth);
export const shuffleSelector = createSelector([configSelector], config => config.shuffle);
export const repeatSelector = createSelector([configSelector], config => config.repeat);
export const appVersionSelector = createSelector([configSelector], config => config.version);
export const audioConfigSelector = createSelector([configSelector], config => config.audio);
export const themeSelector = createSelector([configSelector], config => config.app.theme);
export const isAuthenticatedSelector = createSelector([authTokenStateSelector], auth => !!auth.token);
