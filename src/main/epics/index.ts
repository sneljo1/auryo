import { RootAction } from '@common/store/declarations';
import AbortController from 'abort-controller';
import { StoreState } from 'AppReduxTypes';
import fetch from 'node-fetch';
import { combineEpics } from 'redux-observable';
import * as app from './app';
import * as auth from './auth';
import * as config from './config';

// This is a polyfill for rxjs fetch
global.fetch = fetch;
global.AbortController = AbortController;

export const mainRootEpic = combineEpics<RootAction, RootAction, StoreState>(
  ...Object.values(config),
  ...Object.values(auth),
  ...Object.values(app)
);
