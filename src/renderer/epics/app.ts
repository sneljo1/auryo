import { push, replace } from 'connected-react-router';
import { defer, EMPTY, from, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, first, map, pluck, switchMap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { getRemainingPlays, initApp, toggleStatus } from '../../common/store/actions';
import { openExternalUrl, resolveSoundCloudUrl, toggleOffline } from '../../common/store/app/actions';
import * as APIService from '../../common/store/app/api';
import { RemainingPlays } from '../../common/store/app/types';
import { RootEpic } from '../../common/store/declarations';

export const initAppEpic: RootEpic = (action$, state$) =>
  state$.pipe(
    first(),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const {
        config: { auth }
      } = state;

      if (!auth.token) {
        return of(replace('/login'));
      }

      return of(
        initApp({
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
        map((json) => {
          const plays = json.statuses.find((t) => t.rate_limit.name === 'plays');

          if (plays) {
            return {
              remaining: plays.remaining_requests,
              resetTime: new Date(plays.reset_time).getTime()
            };
          }

          return null;
        }),
        filter<RemainingPlays>(Boolean),
        map((response) => {
          if (response) {
            return getRemainingPlays.success({
              ...response,
              updatedAt: Date.now()
            });
          }

          return getRemainingPlays.success(response);
        }),
        catchError((error) => of(getRemainingPlays.failure({ error })))
      );
    })
  );

export const offlineStatusEpic: RootEpic = () =>
  merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
    map(() => toggleOffline(!navigator.onLine))
  );

export const toggleStatusSpaceBarEpic: RootEpic = () =>
  fromEvent(document, 'keydown').pipe(
    filter<KeyboardEvent>((d) => d.code === 'Space'),
    switchMap((event) => {
      // Only toggle status when not in input field
      if (!(event?.target instanceof HTMLInputElement)) {
        event.preventDefault();
        return of(toggleStatus());
      }

      return EMPTY;
    })
  );

export const resolveUrlEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(resolveSoundCloudUrl)),
    pluck('payload'),
    switchMap((url) =>
      defer(() => APIService.resolveSoundCloudUrl(url)).pipe(
        map((json) => {
          switch (json.kind) {
            case 'track':
              return push(`/track/${json.id}`);
            case 'playlist':
              return push(`/playlist/${json.id}`);
            case 'user':
              return push(`/user/${json.id}`);
            default:
              // eslint-disable-next-line no-console
              console.error('Resolve not implemented for', json.kind);
              return openExternalUrl(url);
          }
        }),
        catchError(() => {
          // If resolving fails. just open externally
          return of(openExternalUrl(url));
        })
      )
    )
  );
