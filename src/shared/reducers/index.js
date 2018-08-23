import { reducer as toastr } from 'react-redux-toastr';
import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { reducer as modal } from 'redux-modal';
import app from './appReducer';
import auth from './authReducer';
import config from './configReducer';
import entities from './entitiesReducer';
import objects from './objectReducer';
import player from './playerReducer';
import ui from './UIReducer';

export default combineReducers({
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
})
