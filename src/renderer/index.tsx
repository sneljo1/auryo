// eslint-disable-next-line import/no-extraneous-dependencies
import 'react-hot-loader';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@common/sentryReporter';
import { history, configureStore } from '@common/store';
import 'boxicons/css/boxicons.min.css';
import { ConnectedRouter } from 'connected-react-router';
import is from 'electron-is';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import './css/app.scss';

let osClass = '';

if (is.macOS()) {
  osClass = 'macOS';
} else if (is.windows()) {
  osClass = 'win';
} else if (is.linux()) {
  osClass = 'linux';
}

document.getElementsByTagName('html')[0].classList.add(osClass);

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
