import '../common/sentryReporter';

// tslint:disable-next-line:no-submodule-imports
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
// tslint:disable-next-line:no-submodule-imports
import 'boxicons/css/boxicons.min.css';
import { remote } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { SC } from '../common/utils';
import { configureStore, history } from './configureStore';
// tslint:disable-next-line:no-submodule-imports
import './css/app.scss';
import Main from './Main';


const app = remote.app;

if (process.env.NODE_ENV === 'development') {
    // const { whyDidYouUpdate } = require('why-did-you-update');
    // whyDidYouUpdate(React);
}

const store = configureStore();

if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {

    const { config: { app: { analytics } } } = store.getState();


    import('../common/utils/universalAnalytics')
        .then(({ ua }) => {
            ua.set('version', app.getVersion());
            ua.set('anonymizeIp', true);
            if (analytics) {
                ua.pv('/').send();

                history.listen((location) => {
                    ua.pv(location.pathname).send();
                });
            }
        });

}

const { config: { token } } = store.getState();

if (token) {
    SC.initialize(token);
}

ReactDOM.render(
    <AppContainer>
        <Main
            store={store}
            history={history}
        />
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./Main', () => {
        const NextApp = require('./Main').default;

        ReactDOM.render(
            <AppContainer>
                <NextApp
                    store={store}
                    history={history}
                />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
