// eslint-disable-next-line import/no-cycle
import { StoreState } from '..';
import { createSelector } from 'reselect';
import { ConfigState } from './types';

export const configSelector = (state: StoreState) => state.config;

export const authConfigSelector = createSelector<StoreState, ConfigState, ConfigState['auth']>(
  [configSelector],
  config => config.auth
);
