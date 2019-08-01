import { RouterState } from "connected-react-router";
import { combineReducers, Reducer } from "redux";
import { reducer as modal } from "redux-modal";
import { appReducer, AppState } from "./app";
import { authReducer, AuthState } from "./auth";
import { configReducer, ConfigState } from "./config";
import { entitiesReducer, EntitiesState } from "./entities";
import { objectsReducer, ObjectsState } from "./objects";
import { playerReducer, PlayerState } from "./player";
import { uiReducer, UIState } from "./ui";

export const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
  player: playerReducer,
  objects: objectsReducer,
  app: appReducer,
  config: configReducer,
  ui: uiReducer,
  modal: modal as Reducer
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
