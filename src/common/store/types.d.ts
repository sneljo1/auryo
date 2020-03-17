import { routerActions, CallHistoryMethodAction, RouterState } from 'connected-react-router';
import { Epic } from 'redux-observable';
import { ActionType, StateType } from 'typesafe-actions';
import * as app from './app/actions';
import * as appAuth from './appAuth/actions';
import * as auth from './auth/actions';
import * as config from './config/actions';
import * as objects from './objects/actions';
import * as search from './objects/playlists/search/actions';
import * as player from './player/actions';
import * as playlist from './playlist/actions';
import * as track from './track/actions';
import * as ui from './ui/actions';
import * as user from './user/actions';
import { LocationState } from 'history';
import { AppAuthState } from './appAuth';
import { AuthState } from './auth';
import { EntitiesState } from './entities';
import { PlayerState } from './player';
import { ObjectsState } from './objects';
import { AppState } from './app';
import { ConfigState } from './config';
import { UIState } from './ui';
import { RootState } from 'AppReduxTypes';

// Hack to fix https://github.com/supasate/connected-react-router/issues/286
type Push = (path: Path, state?: LocationState) => CallHistoryMethodAction<[Path, LocationState?]>;
// type Go, etc.

interface RouterActions {
  push: Push;
  replace: Push;
  // go: Go; etc.
}

export interface StoreState {
  appAuth: AppAuthState;
  auth: AuthState;
  entities: EntitiesState;
  player: PlayerState;
  objects: ObjectsState;
  app: AppState;
  config: ConfigState;
  ui: UIState;
  router: RouterState;
  modal: any;
}

type actions = {
  search: typeof search;
  objects: typeof objects;
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

export type RootEpic = Epic<RootAction, RootAction, RootState>;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}

declare module 'react-redux' {
  export interface DefaultRootState extends RootState {}
}
