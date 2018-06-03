import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'
import auth from './authReducer'
import entities from './entitiesReducer'
import player from '../../renderer/modules/player/player.reducer'
import objects from './objectReducer'
import app from './appReducer'
import config from './configReducer'
import ui from './UIReducer'
import { reducer as modal } from 'redux-modal'

import { reducer as toastr } from 'react-redux-toastr'

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
