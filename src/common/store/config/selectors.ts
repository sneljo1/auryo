// eslint-disable-next-line import/no-unresolved
import { RootState } from 'AppReduxTypes';
import { createSelector } from 'reselect';
import { ConfigState } from './types';

export const configSelector = (state: RootState) => state.config;

export const authTokenStateSelector = createSelector<RootState, ConfigState, ConfigState['auth']>(
  [configSelector],
  config => config.auth
);
