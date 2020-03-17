import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@common/sentryReporter';
import store, { history } from '@common/store';
import { initApp } from '@common/store/actions';
import 'boxicons/css/boxicons.min.css';
import is from 'electron-is';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './css/app.scss';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

let osClass = '';

if (is.macOS()) {
  osClass = 'macOS';
} else if (is.windows()) {
  osClass = 'win';
} else if (is.linux()) {
  osClass = 'linux';
}

document.getElementsByTagName('html')[0].classList.add(osClass);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line
  // const { whyDidYouUpdate } = require('why-did-you-update');
  // whyDidYouUpdate(React);
}

store.dispatch(initApp());

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
