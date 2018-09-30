/* eslint-disable global-require */
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { CONFIG } from '../config';
import { SC } from '../shared/utils';
import { configureStore, history } from './configureStore';
import Main from './Main';
const app = require('electron').remote.app;

const store = configureStore();

if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {

    const { config: { app: { analytics, crashReports } } } = store.getState();

    if (crashReports) {
        const Raven = require('raven-js');

        Raven.config(CONFIG.SENTRY_REPORT_URL).install();
    }

    if (analytics) {
        const ua = require('../shared/utils/universalAnalytics');

        ua().set('version', app.getVersion());
        ua().set('anonymizeIp', true);

        ua().pv('/').send();

        history.listen((location) => {
            ua().pv(location.pathname).send();
        });
    }

}

const { config: { token } } = store.getState();

if (token) {
    SC.initialize(token);
}

render(
    <AppContainer>
        <Main store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./Main', () => {
        const NextRoot = require('./Main');
        render(
            <AppContainer>
                <NextRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
