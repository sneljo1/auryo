import React from 'react';
import { Route, Switch, RouteComponentProps, StaticContext } from 'react-router';
import { Redirect } from 'react-router-dom';
import App from './modules/app/App';
import Login from './modules/login/Login';
import Spinner from './modules/_shared/Spinner/Spinner';
import WelcomeModal from './modules/app/components/modals/WelcomeModal/WelcomeModal';
import { resolveUrl } from '../shared/utils/soundcloudUtils';

const Routes: React.SFC = () => (
    <div>
        <WelcomeModal />
        <Switch>
            <Route name='Login' path='/login' component={Login} />
            <Route name='Resolve' path='/resolve' render={(props: RouteComponentProps<any, StaticContext, { url?: string }>) => {
                const { location: { state: {url} } } = props;

                if (!url) {
                    return <Redirect to='/' />;
                }

                resolveUrl(url);

                return <Spinner full={true} />;
            }} />
            <Route path='/' component={App} />
        </Switch>
    </div>
);

export default Routes;
