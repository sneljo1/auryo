import { EVENTS } from '@common/constants/events';
import { history } from '@common/store';
import { toggleStatus } from '@common/store/actions';
import { configSelector } from '@common/store/selectors';
import { ua } from '@common/utils/universalAnalytics';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer, remote } from 'electron';
import { UnregisterCallback } from 'history';
import React, { FC, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader/root';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { useKey } from 'react-use';
import Main from './app/Main';
import { OnBoarding } from './pages/onboarding/OnBoarding';

export const App: FC = () => {
  const dispatch = useDispatch();
  const analyticsEnabled = useSelector(state => configSelector(state).app.analytics);

  // Toggle player on Space
  useKey(
    ' ',
    event => {
      // Only toggle status when not in input field
      if (!(event?.target instanceof HTMLInputElement)) {
        dispatch(toggleStatus());
      }

      // Prevent body from scrolling when pressing Space
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
  }, []);

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
