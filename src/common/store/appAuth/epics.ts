import { SC } from '@common/utils';
import { TokenResponse } from '@main/aws/awsIotService';
import { replace } from 'connected-react-router';
import { of } from 'rxjs';
import { filter, map, mergeMap, switchMap, tap, withLatestFrom, pluck } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { CONFIG } from '../../../config';
import {
  finishOnboarding,
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserPlaylists,
  getCurrentUserRepostIds,
  getRemainingPlays,
  loginSuccess,
  logout,
  refreshToken,
  resetStore,
  setConfigKey
} from '../actions';
import { RootEpic } from '../declarations';
import { configSelector } from '../selectors';

export const setTokenEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf([loginSuccess, refreshToken])),
    pluck('payload'),
    filter((payload): payload is TokenResponse => !!payload?.access_token),
    // TODO: should we also try to set this in the frontend?
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
          getCurrentUser.request({}),
          // Fetch follow Ids
          getCurrentUserFollowingsIds.request(),
          // Fetch like Ids
          getCurrentUserLikeIds.request(),
          // Fetch repost Ids
          getCurrentUserRepostIds.request(),
          // Fetch playlists user owns
          getCurrentUserPlaylists.request({}),
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
