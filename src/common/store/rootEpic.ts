import { RootState } from 'AppReduxTypes';
import { combineEpics } from 'redux-observable';
import * as app from './app/epics';
import * as appAuth from './appAuth/epics';
import * as auth from './auth/epics';
// import * as objects from './objects/epics';
import * as playlist from './playlist/epics';
import { RootAction } from './types';
import * as ui from './ui/epics';

export const rootEpic = combineEpics<RootAction, RootAction, RootState>(
  ...Object.values(app),
  ...Object.values(appAuth),
  ...Object.values(ui),
  ...Object.values(auth),
  ...Object.values(playlist)
);
