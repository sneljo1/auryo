import {
  login,
  logout,
  receiveProtocolAction,
  resetStore,
  setConfigKey,
  startLoginSession,
  tokenRefresh,
  verifyLoginSession
} from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { configSelector } from '@common/store/selectors';
import { TokenResponse } from '@common/store/types';
import { Logger } from '@main/utils/logger';
import { pkceChallenge } from '@main/utils/pkce';
import Axios from 'axios-observable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { shell } from 'electron';
import { stopForwarding } from 'electron-redux';
import { merge } from 'lodash';
import * as querystring from 'querystring';
import { concat, iif, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  pluck,
  startWith,
  switchMap,
  takeUntil,
  tap,
  timeout,
  withLatestFrom
} from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { v4 } from 'uuid';
import { CONFIG } from '../../config';

const logger = Logger.createLogger('EPIC/main/auth');

export const loginEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(login.request)),

    // Initialize flow
    map(() => ({
      uuid: v4(),
      challenge: pkceChallenge()
    })),
    tap(({ uuid, challenge }) => {
      const queryParams = querystring.stringify({
        response_type: 'code',
        state: uuid,
        code_challenge: challenge.codeChallenge,
        code_challenge_method: 'S256'
      });
      shell.openExternal(`${CONFIG.AURYO_API_URL}/authorize?${queryParams}`);
    }),
    switchMap(({ uuid, challenge }) =>
      action$.pipe(
        startWith(stopForwarding(startLoginSession({ uuid, codeVerifier: challenge.codeVerifier }))),
        filter(isActionOf(receiveProtocolAction)),
        takeUntil(action$.pipe(filter(isActionOf([login.request, login.failure, login.success, login.cancel])))),
        pluck('payload'),
        filter(({ action }) => action === 'auth'),
        // 5 minute timeout
        timeout(60000 * 5),
        switchMap(({ params }) =>
          iif(
            // If session uuid matched the current one
            () => !!params.code && !!params.state && params.state === uuid,
            // continue as normal
            concat(
              of(stopForwarding(verifyLoginSession())),
              Axios.post(
                CONFIG.AURYO_API_TOKEN_URL,
                querystring.stringify({
                  grant_type: 'authorization_code',
                  code: params.code,
                  code_verifier: challenge.codeVerifier,
                  redirect_uri: CONFIG.AURYO_API_CALLBACK_URL
                }),
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                }
              ).pipe(
                pluck('data'),
                tap(() => console.log('test')),
                map(login.success),
                catchError((err) => {
                  logger.error('Error during login', err);
                  return of(logout(), login.failure({}));
                })
              )
            ),
            // Otherwise throw error and
            of(login.failure({ message: 'The session may have expired, please try logging in again.' }))
          )
        ),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            return of(login.cancel({}));
          }

          return of(login.failure({ message: 'Something went wrong during login. Please try again.' }));
        })
      )
    )
  );

export const tokenRefreshEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(tokenRefresh.request)),
    withLatestFrom(state$),
    map(([, state]) => ({
      refreshToken: configSelector(state).auth.refreshToken
    })),
    switchMap(({ refreshToken }) => {
      return Axios.request<TokenResponse>({
        url: CONFIG.AURYO_API_TOKEN_URL,
        method: 'POST',
        data: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).pipe(
        pluck('data'),
        map(tokenRefresh.success),
        catchError((err) => {
          logger.error('Error refreshing token', err);
          return of(logout(), tokenRefresh.failure({}));
        })
      );
    })
  );

export const logoutEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(logout)),
    mergeMap(() => merge(of(setConfigKey('auth', CONFIG.DEFAULT_CONFIG.auth)), of(resetStore())))
  );
