import React from 'react'
import { Route, Switch } from 'react-router'
import App from './modules/app/app.container'
import Login from './modules/login/login.container'
import { resolveUrl } from '../shared/actions/app/window.actions'
import UtilitiesModal from './modules/UtilitiesModel/UtilitiesModal'

const Routes = () => (
    <Switch>
        <Route name="Login" path="/login" component={Login} />
        <Route name="Resolve" path="/resolve"
               onEnter={(nextState, replace) => resolveUrl(nextState.location.query.url, store.dispatch)} />

        <Route path="/" component={App} />
    </Switch>
)

export default Routes