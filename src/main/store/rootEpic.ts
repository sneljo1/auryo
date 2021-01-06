import { RootAction } from '@common/store/declarations';
import AbortController from 'abort-controller';
import { StoreState } from 'AppReduxTypes';
import fetch from 'node-fetch';
import { combineEpics } from 'redux-observable';
import * as app from './epics/app';
import * as auth from './epics/auth';
import * as config from './epics/config';

// This is a polyfill for rxjs fetch
global.fetch = fetch;
global.AbortController = AbortController;

export const mainRootEpic = combineEpics<RootAction, RootAction, StoreState>(
  ...Object.values(config),
  ...Object.values(auth),
  ...Object.values(app)
);
