import { SC } from '@common/utils';
import { replace } from 'connected-react-router';
import { of } from 'rxjs';
import { exhaustMap, filter, mergeMap, pluck, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { TokenResponse } from '../../common/store/appAuth';
import { CONFIG } from '../../config';
import {
  finishOnboarding,
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserPlaylists,
  getCurrentUserRepostIds,
  getRemainingPlays,
  initApp,
  login,
  logout,
  resetStore,
  setConfigKey,
  tokenRefresh
} from '../../common/store/actions';
import { RootEpic } from '../../common/store/declarations';
import { configSelector } from '../../common/store/selectors';

export const setTokenEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf([login.success, tokenRefresh.success, initApp])),
    pluck('payload'),
    tap((payload) => console.log('setTokenEpic', payload)),
    filter((payload): payload is TokenResponse => !!payload?.access_token),
    tap((payload) => SC.initialize(payload.access_token)),
    filter((payload): payload is TokenResponse => !!payload.refresh_token),
    mergeMap((payload) =>
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
    filter(isActionOf([login.success, initApp])),
    withLatestFrom(state$),
    tap(([payload]) => console.log('loginEpic', payload)),
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

export const finishOnboardingEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(finishOnboarding)),
    tap((payload) => console.log('finishOnboardingEpic', payload)),
    exhaustMap(() => of(setConfigKey('lastLogin', Date.now()), login.success({})))
  );

export const logoutEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(logout)),
    mergeMap(() => of(setConfigKey('auth', CONFIG.DEFAULT_CONFIG.auth), resetStore(), replace('/login')))
  );
