import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const appSelector = (state: StoreState) => state.app;

export const isUpdateAvailableSelector = createSelector(appSelector, (app) => app.update.available);
export const remainingPlaysSelector = createSelector(appSelector, (app) => app.remainingPlays);
export const castSelector = createSelector(appSelector, (app) => app.chromecast);
export const isPlayingOnChromecastSelector = createSelector(castSelector, (chromecast) => !!chromecast.castApp);
export const loadingErrorSelector = createSelector(appSelector, (app) => app.loadingError);
export const lastFmLoadingSelector = createSelector(appSelector, (app) => app.lastfmLoading);
