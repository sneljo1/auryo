import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import { stopWatchers, toggleStatus } from '@common/store/actions';
import { ConnectedRouter } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { History } from 'history';
import React, { FC, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Store } from 'redux';
import Main from './app/Main';
import OnBoarding from './pages/onboarding/OnBoarding';

interface Props {
  history: History;
  store: Store<StoreState>;
}

export const App: FC<Props> = ({ history, store }) => {
  useEffect(() => {
    ipcRenderer.send(EVENTS.APP.READY);

    const unregister = history.listen(() => {
      ipcRenderer.send(EVENTS.APP.NAVIGATE);
    });

    const onKeyUp = (e: KeyboardEvent) => {
      // When space bar pressed
      if (e.keyCode === 32) {
        // Prevent from scrolling
        store.dispatch(toggleStatus() as any);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent body from scrolling
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
        return false;
      }

      return true;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      store.dispatch(stopWatchers() as any);
      unregister();
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/login" component={OnBoarding} />
          <Route path="/" component={Main} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
};

export default hot(App);
