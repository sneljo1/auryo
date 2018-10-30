import { combineReducers, Reducer } from 'redux';
import { reducer as modal } from 'redux-modal';
import { appReducer, AppState } from './app';
import { authReducer, AuthState } from './auth';
import { configReducer, ConfigState } from './config';
import { objectsReducer, ObjectsState } from './objects';
import { PlayerState, playerReducer } from './player';
import { uiReducer, UIState } from './ui';
import { RouterState } from 'connected-react-router';
import { EntitiesState, entitiesReducer } from './entities';

export const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
  player: playerReducer,
  objects: objectsReducer,
  app: appReducer,
  config: configReducer,
  ui: uiReducer,
  modal: modal as Reducer<any>
});

export interface StoreState {
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
