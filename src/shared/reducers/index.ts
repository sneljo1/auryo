import { reducer as toastr, ToastrState } from 'react-redux-toastr';
import { routerReducer as routing, RouterState } from 'react-router-redux';
import { combineReducers } from 'redux';
import { reducer as modal } from 'redux-modal';
import app from './appReducer';
import auth from './authReducer';
import config from './configReducer';
import entities from './entitiesReducer';
import objects from './objectReducer';
import player from './playerReducer';
import ui from './UIReducer';

export const rootReducer = combineReducers<StoreState>({
  auth,
  entities,
  player,
  objects,
  app,
  config,
  ui,
  toastr,
  routing,
  modal
});

export type StoreState = {
  auth: any
  entities: any
  player: any
  objects: any
  app: any
  config: any
  ui: any
  toastr: ToastrState
  routing: RouterState
  modal: any
};
