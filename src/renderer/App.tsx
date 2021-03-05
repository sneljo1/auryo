import { EVENTS } from '@common/constants/events';
import { history } from '@common/store';
import { configSelector } from '@common/store/selectors';
import { ua } from '@common/utils/universalAnalytics';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer, remote } from 'electron';
import { UnregisterCallback } from 'history';
import React, { FC, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import Main from './app/Main';
import { OnBoarding } from './pages/onboarding/OnBoarding';

const App: FC = () => {
  const analyticsEnabled = useSelector((state) => configSelector(state).app.analytics);

  useEffect(() => {
    ipcRenderer.send(EVENTS.APP.READY);
  }, []);

  // Page analytics
  useEffect(() => {
    let unregister: UnregisterCallback;

    if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {
      ua.set('version', remote.app.getVersion());
      ua.set('anonymizeIp', true);
      if (analyticsEnabled) {
        ua.pv('/').send();

        unregister = history.listen((location) => {
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

export default hot(module)(App);
