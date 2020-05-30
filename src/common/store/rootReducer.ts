import { connectRouter } from 'connected-react-router';
import { MemoryHistory } from 'history';
import { combineReducers } from 'redux';
import { reducer as modal } from 'redux-modal';
import { appReducer } from './app/reducer';
import { appAuthReducer } from './appAuth/reducer';
import { authReducer } from './auth/reducer';
import { configReducer } from './config/reducer';
import { entitiesReducer } from './entities/reducer';
import { objectsReducer } from './objects/reducer';
import { playerReducer } from './player/reducer';
import { uiReducer } from './ui/reducer';
import { StoreState } from 'AppReduxTypes';
import { trackReducer } from './track/reducer';
import { userReducer } from './user/reducer';

export const rootReducer = (history: MemoryHistory) =>
  combineReducers<StoreState>({
    auth: authReducer,
    appAuth: appAuthReducer,
    entities: entitiesReducer,
    player: playerReducer,
    objects: objectsReducer,
    app: appReducer,
    config: configReducer,
    ui: uiReducer,
    modal,
    router: connectRouter(history),
    track: trackReducer,
    user: userReducer
  });
