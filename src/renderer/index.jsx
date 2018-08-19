/* eslint-disable global-require */
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { version } from '../../package.json';
import config from '../config';
import { SC } from '../shared/utils';
import { configureStore, history } from './configureStore';
import './css/app.scss';
import Root from './Root';

const store = configureStore()

if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {

    const { config: { app: { analytics, crashReports } } } = store.getState()

    if (crashReports) {
        const Raven = require('raven-js')

        Raven.config(config.SENTRY_URL).install()
    }

    if (analytics) {
        const ua = require('../shared/utils/universalAnalytics')

        ua().set('version', version)

        history.listen((location) => {
            ua().pv(location.pathname).send()
        })
    }

}

const { config: { token } } = store.getState()

if (token) {
    SC.initialize(token)
}

render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
)

if (module.hot) {
    module.hot.accept('./Root', () => {
        const NextRoot = require('./Root') // eslint-disable-line global-require
        render(
            <AppContainer>
                <NextRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('root')
        )
    })
}