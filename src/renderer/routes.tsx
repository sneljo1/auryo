import * as React from 'react';
import { Route, Switch } from 'react-router';
import App from './modules/app/App';
import WelcomeModal from './modules/app/components/modals/WelcomeModal/WelcomeModal';
import Login from './modules/login/Login';

const Routes: React.SFC = () => (
    <div>
        <WelcomeModal />
        <Switch>
            <Route name='Login' path='/login' component={Login} />
            <Route path='/' component={App} />
        </Switch>
    </div>
);

export default Routes;
