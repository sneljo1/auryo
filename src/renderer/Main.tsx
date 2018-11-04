import { ConnectedRouter } from 'connected-react-router';
import { ipcRenderer } from 'electron';
import { History } from 'history';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Store } from 'redux';
import { EVENTS } from '../common/constants/events';
import { StoreState } from '../common/store';
import App from './app/App';
import WelcomeModal from './app/components/modals/WelcomeModal/WelcomeModal';
import Login from './pages/login/Login';

interface OwnProps {
    store: Store<StoreState>;
    history: History;
}

class Main extends React.PureComponent<OwnProps> {

    componentDidMount() {
        const { history } = this.props;

        ipcRenderer.send(EVENTS.APP.READY);

        history.listen(() => {
            ipcRenderer.send(EVENTS.APP.NAVIGATE);
        });
    }

    render() {
        const { store, history } = this.props;

        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <>
                        <WelcomeModal />
                        <Switch>
                            <Route name='Login' path='/login' component={Login} />
                            <Route path='/' component={App} />
                        </Switch>
                    </>
                </ConnectedRouter>
            </Provider>

        );
    }
}

export default connect<{}, {}, OwnProps, StoreState>(null)(Main);
