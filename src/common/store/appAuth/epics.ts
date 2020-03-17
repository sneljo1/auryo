import { replace } from 'connected-react-router';
import { of } from 'rxjs';
import { filter, map, mergeMap, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { resetStore, getRemainingPlays } from '../app/actions';
import { setConfigKey } from '../config/actions';
import { RootEpic } from '../types';
import { loginSuccess, logout, refreshToken, finishOnboarding } from './actions';
import { configSelector } from '../config/selectors';
import { TokenResponse } from '@main/aws/awsIotService';
import { SC } from '@common/utils';
import {
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserRepostIds,
  getCurrentUserPlaylists
} from '../auth/actions';
import { CONFIG } from 'src/config';

export const setTokenEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf([loginSuccess, refreshToken])),
    map(action => action.payload),
    filter((payload): payload is TokenResponse => !!payload?.access_token),
    tap(payload => SC.initialize(payload.access_token)),
    filter((payload): payload is TokenResponse => !!payload.refresh_token),
    mergeMap(payload =>
      of(
        setConfigKey('auth', {
          expiresAt: payload.expires_at,
          refreshToken: payload.refresh_token,
          token: payload.access_token
        })
      )
    )
  );

export const loginEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(loginSuccess)),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const config = configSelector(state);

      if (config.lastLogin) {
        return of(
          replace('/'),
          // Fetch user
          getCurrentUser.request(),
          // Fetch follow Ids
          getCurrentUserFollowingsIds.request(),
          // Fetch like Ids
          getCurrentUserLikeIds.request(),
          // Fetch repost Ids
          getCurrentUserRepostIds.request(),
          // Fetch playlists user owns
          getCurrentUserPlaylists.request(),
          getRemainingPlays.request()
        );
      }

      return of(replace('/login/welcome'));
    })
  );

export const finishOnboardingEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(finishOnboarding)),
    mergeMap(() => of(setConfigKey('lastLogin', Date.now()), loginSuccess()))
  );

export const logoutEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(logout)),
    mergeMap(() => of(setConfigKey('auth', CONFIG.DEFAULT_CONFIG.auth), resetStore(), replace('/login')))
  );
