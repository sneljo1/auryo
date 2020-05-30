import { replace } from 'connected-react-router';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { RootEpic } from '../declarations';
import { getRemainingPlays, initApp, loginSuccess } from '../actions';
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
        loginSuccess({
          access_token: auth.token
        })
      );
    })
  );

export const getRemainingPlaysEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getRemainingPlays.request)),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const {
        config: {
          app: { overrideClientId }
        }
      } = state;

      return from(APIService.fetchRemainingTracks(overrideClientId)).pipe(
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
