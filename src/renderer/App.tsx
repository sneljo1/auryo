import { EVENTS } from '@common/constants/events';
import { history } from '@common/store';
import { stopWatchers, toggleStatus } from '@common/store/actions';
import { configSelector } from '@common/store/config/selectors';
import { ConnectedRouter, push } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer, remote } from 'electron';
import { UnregisterCallback } from 'history';
import React, { FC, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader/root';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import Main from './app/Main';
import OnBoarding from './pages/onboarding/OnBoarding';
import { ua } from '@common/utils/universalAnalytics';
import { useKey } from 'react-use';

export const App: FC = () => {
  const analyticsEnabled = useSelector(state => configSelector(state).app.analytics);
  const dispatch = useDispatch();

  // Toggle player on Space
  // TODO re-enable
  // useKey(' ', () => dispatch(toggleStatus() as any), { event: 'keyup' });
  // Prevent body from scrolling when pressing Space
  useKey(
    ' ',
    event => {
      if (event.target === document.body) {
        event.preventDefault();
        return false;
      }

      return true;
    },
    { event: 'keydown' }
  );

  useEffect(() => {
    ipcRenderer.send(EVENTS.APP.READY);

    const unregister = history.listen(() => {
      ipcRenderer.send(EVENTS.APP.NAVIGATE);
    });

    return () => {
      dispatch(stopWatchers() as any);
      unregister();
    };
  }, [dispatch]);

  // Page analytics
  useEffect(() => {
    let unregister: UnregisterCallback;

    if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {
      ua.set('version', remote.app.getVersion());
      ua.set('anonymizeIp', true);
      if (analyticsEnabled) {
        ua.pv('/').send();

        unregister = history.listen(location => {
          ua.pv(location.pathname).send();
        });
      }
    }

    return () => {
      unregister?.();
    };
  }, [analyticsEnabled]);

  return (
    <Switch>
      <Route path="/login/:step?" component={OnBoarding} />
      <Route path="/" component={Main} />
    </Switch>
  );
};

export default hot(App);
