import PropTypes from "prop-types";
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { EVENTS } from '../shared/constants/events';
import { windowRouter } from '../shared/utils/router';
import Routes from './routes';

class Root extends React.Component {

    componentDidMount() {
        const { history } = this.props;

        windowRouter.send(EVENTS.APP.READY)

        history.listen(() => {
            windowRouter.send('GO')
        })
    }

    render() {
        const { store, history } = this.props

        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Routes store={store} />
                </ConnectedRouter>
            </Provider>

        )
    }
}

Root.propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
}

export default Root