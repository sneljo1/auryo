import { RootState, StoreState } from 'AppReduxTypes';
import { CallHistoryMethodAction, routerActions } from 'connected-react-router';
import { LocationState } from 'history';
import { Epic } from 'redux-observable';
import { ActionType, StateType } from 'typesafe-actions';
import * as app from './app/actions';
import * as appAuth from './appAuth/actions';
import * as auth from './auth/actions';
import * as config from './config/actions';
import * as player from './player/actions';
import * as playlist from './playlist/actions';
import * as track from './track/actions';
import * as ui from './ui/actions';
import * as user from './user/actions';

// Hack to fix https://github.com/supasate/connected-react-router/issues/286
type Push = (path: Path, state?: LocationState) => CallHistoryMethodAction<[Path, LocationState?]>;
// type Go, etc.

interface RouterActions {
  push: Push;
  replace: Push;
  // go: Go; etc.
}

type actions = {
  player: typeof player;
  track: typeof track;
  user: typeof user;
  ui: typeof ui;
  playlist: typeof playlist;
  app: typeof app;
  appAuth: typeof appAuth;
  auth: typeof auth;
  config: typeof config;
  routerActions: typeof routerActions;
};

type _Store = StateType<typeof import('.').default>;
type _RootAction = ActionType<actions> | ActionType<RouterActions>;

export type Store = _Store;
export type RootAction = _RootAction;

export type RootEpic = Epic<RootAction, RootAction, StoreState>;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}

declare module 'react-redux' {
  export interface DefaultRootState extends StoreState {}
}
