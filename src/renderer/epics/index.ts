import { StoreState } from 'AppReduxTypes';
import { combineEpics } from 'redux-observable';
import * as app from './app';
import * as appAuth from './appAuth';
import * as auth from './auth';
import { RootAction } from '../../common/store/declarations';
import * as playlist from './playlist';
import * as player from './player';
import * as ui from './ui';
import * as track from './track';
import * as user from './user';
import * as audio from './audio';

export const rootEpic = combineEpics<RootAction, RootAction, StoreState>(
  ...Object.values(app),
  ...Object.values(appAuth),
  ...Object.values(ui),
  ...Object.values(auth),
  ...Object.values(playlist),
  ...Object.values(track),
  ...Object.values(user),
  ...Object.values(player),
  ...Object.values(audio)
);
