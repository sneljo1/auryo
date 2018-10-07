import { remote } from 'electron';
import * as React from 'react';
import { render } from 'react-dom';
import { CONFIG } from '../config';
import { SC } from '../common/utils';
import { configureStore, history } from './configureStore';
import Main from './Main';

// Import CSS
import '../assets/fonts/iconmoon/style.css';
// tslint:disable-next-line:no-submodule-imports
import 'rc-slider/dist/rc-slider.css';
// tslint:disable-next-line:no-submodule-imports
import '@blueprintjs/core/lib/css/blueprint.css';
// tslint:disable-next-line:no-submodule-imports
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
// tslint:disable-next-line:no-submodule-imports
import 'boxicons/css/boxicons.min.css';
// tslint:disable-next-line:no-submodule-imports
import './css/app.scss';

const app = remote.app;

if (process.env.NODE_ENV === 'development') {
    // const { whyDidYouUpdate } = require('why-did-you-update');
    // whyDidYouUpdate(React);
}

const store = configureStore();

if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {

    const { config: { app: { analytics, crashReports } } } = store.getState();

    if (crashReports) {
        import('raven-js')
            .then((raven) => {
                raven.config(CONFIG.SENTRY_REPORT_URL).install();
            });

    }

    if (analytics) {
        import('../common/utils/universalAnalytics')
            .then(({ ua }) => {
                ua.set('version', app.getVersion());
                ua.set('anonymizeIp', true);

                ua.pv('/').send();

                history.listen((location) => {
                    ua.pv(location.pathname).send();
                });
            });
    }
}

const { config: { token } } = store.getState();

if (token) {
    SC.initialize(token);
}

render(
    // <AppContainer>
    <Main store={store} history={history} />,
    // </AppContainer>,
    document.getElementById('app')
);

// if (module.hot) {
//     module.hot.accept('./Main', () => {
//         const NextRoot = require('./Main');
//         render(
//             <AppContainer>
//                 <NextRoot store={store} history={history} />
//             </AppContainer>,
//             document.getElementById('root')
//         );
//     });
// }
