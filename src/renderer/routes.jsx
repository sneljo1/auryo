import React from 'react'
import { Route, Switch } from 'react-router'
import App from './modules/app/App'
import Login from './modules/login/Login'
import { resolveUrl } from '../shared/actions/app/window.actions'
import { Redirect } from 'react-router-dom';
import Spinner from './modules/_shared/Spinner/Spinner';

const Routes = () => (
    <Switch>
        <Route name="Login" path="/login" component={Login} />
        <Route name="Resolve" path="/resolve" render={(props) => {
            if (!props.location.query) {
                return <Redirect to="/" />
            }

            resolveUrl(props.location.query.url, props.history)

            return <Spinner full />
        }} />
        <Route path="/" component={App} />
    </Switch>
)

export default Routes