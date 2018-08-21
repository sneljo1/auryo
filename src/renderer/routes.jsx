/* eslint-disable react/prop-types */
import React from 'react';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import { resolveUrl } from '../shared/actions/app/window.actions';
import App from './modules/app/App';
import Login from './modules/login/Login';
import Spinner from './modules/_shared/Spinner/Spinner';
import WelcomeModal from './modules/app/components/modals/WelcomeModal/WelcomeModal';

const Routes = () => (
    <div>
        <WelcomeModal />
        <Switch>
            <Route name="Login" path="/login" component={Login} />
            <Route name="Resolve" path="/resolve" render={(props) => {
                const { location: { query }, history } = props
                if (!query) {
                    return <Redirect to="/" />
                }

                resolveUrl(query.url, history)

                return <Spinner full />
            }} />
            <Route path="/" component={App} />
        </Switch>
    </div>
)

export default Routes