import { ipcRenderer } from 'electron';
import { History } from 'history';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { Store } from 'redux';
import { EVENTS } from '../common/constants/events';
import { StoreState } from '../common/store';
import Routes from './routes';
import { ConnectedRouter } from 'connected-react-router';

interface PropsFromState {
}

interface PropsFromDispatch {
    [key: string]: any;
}

interface OwnProps {
    store: Store<StoreState>;
    history: History;
}

type AllProps = PropsFromState & PropsFromDispatch & OwnProps;

class Main extends React.Component<AllProps> {

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
                    <Routes />
                </ConnectedRouter>
            </Provider>

        );
    }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(null)(Main);
