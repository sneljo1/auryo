import React from 'react'
import { Route, Switch } from 'react-router'
import App from './modules/app/App'
import Login from './modules/login/Login'
import { resolveUrl } from '../shared/actions/app/window.actions'

const Routes = ({ store }) => (
    <Switch>
        <Route name="Login" path="/login" component={Login} />
        <Route name="Resolve" path="/resolve"
            onEnter={(nextState) => resolveUrl(nextState.location.query.url, store.dispatch)} />
        <Route path="/" component={App} />
    </Switch>
)

export default Routes