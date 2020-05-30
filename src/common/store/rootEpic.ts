import { StoreState } from 'AppReduxTypes';
import { combineEpics } from 'redux-observable';
import * as app from './app/epics';
import * as appAuth from './appAuth/epics';
import * as auth from './auth/epics';
import { RootAction } from './declarations';
import * as playlist from './playlist/epics';
import * as player from './player/epics';
import * as ui from './ui/epics';
import * as track from './track/epics';
import * as user from './user/epics';

export const rootEpic = combineEpics<RootAction, RootAction, StoreState>(
  ...Object.values(app),
  ...Object.values(appAuth),
  ...Object.values(ui),
  ...Object.values(auth),
  ...Object.values(playlist),
  ...Object.values(track),
  ...Object.values(user),
  ...Object.values(player)
);
