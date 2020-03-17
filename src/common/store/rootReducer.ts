import { connectRouter, RouterState } from 'connected-react-router';
import { MemoryHistory } from 'history';
import { combineReducers } from 'redux';
import { reducer as modal } from 'redux-modal';
import { appReducer, AppState } from './app';
import { appAuthReducer, AppAuthState } from './appAuth';
import { authReducer, AuthState } from './auth';
import { configReducer, ConfigState } from './config';
import { entitiesReducer, EntitiesState } from './entities';
import { objectsReducer, ObjectsState } from './objects';
import { playerReducer, PlayerState } from './player';
import { uiReducer, UIState } from './ui';

export const rootReducer = (history: MemoryHistory) =>
  combineReducers({
    auth: authReducer,
    appAuth: appAuthReducer,
    entities: entitiesReducer,
    player: playerReducer,
    objects: objectsReducer,
    app: appReducer,
    config: configReducer,
    ui: uiReducer,
    modal,
    router: connectRouter(history)
  });

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
