import { replace } from 'connected-react-router';
import { from, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { getRemainingPlays, initApp, login } from '../actions';
import { configSelector } from '../config/selectors';
import { RootEpic } from '../declarations';
import { toggleOffline } from './actions';
import * as APIService from './api';

export const initAppEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(initApp)),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const {
        config: { auth }
      } = state;

      if (!auth.token) {
        return of(replace('/login'));
      }

      return of(
        login.success({
          access_token: auth.token
        })
      );
    })
  );

export const getRemainingPlaysEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getRemainingPlays.request)),
    withLatestFrom(state$),
    switchMap(() => {
      return from(APIService.fetchRemainingTracks()).pipe(
        map(response => {
          if (response) {
            return getRemainingPlays.success({
              ...response,
              updatedAt: Date.now()
            });
          }

          return getRemainingPlays.success(response);
        }),
        catchError(error => of(getRemainingPlays.failure({ error })))
      );
    })
  );

export const OfflineStatusEpic: RootEpic = () =>
  merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
    map(() => toggleOffline(!navigator.onLine))
  );
