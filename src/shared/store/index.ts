import { reducer as toastr, ToastrState } from 'react-redux-toastr';
import { routerReducer as routing, RouterState } from 'react-router-redux';
import { combineReducers } from 'redux';
import { reducer as modal } from 'redux-modal';
import { appReducer, AppState } from './app';
import { authReducer, AuthState } from './auth';
import { configReducer, ConfigState } from './config';
import { entitiesReducer, EntitiesState, objectsReducer, ObjectsState } from './objects';
import { PlayerState, playerReducer } from './player';
import { uiReducer, UIState } from './ui';


export const rootReducer = combineReducers<StoreState>({
  auth: authReducer,
  entities: entitiesReducer,
  player: playerReducer,
  objects: objectsReducer,
  app: appReducer,
  config: configReducer,
  ui: uiReducer,
  toastr,
  routing,
  modal
});

export interface StoreState {
  auth: AuthState;
  entities: EntitiesState;
  player: PlayerState;
  objects: ObjectsState;
  app: AppState;
  config: ConfigState;
  ui: UIState;
  toastr: ToastrState;
  routing: RouterState;
  modal: any;
}
