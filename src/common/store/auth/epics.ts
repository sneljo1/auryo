import { ObjectMap, Normalized } from '@types';
import { empty, forkJoin, from, of } from 'rxjs';
import { catchError, filter, first, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { EmptyAction, isActionOf } from 'typesafe-actions';
import { RootEpic, RootState } from '../types';
import {
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserRepostIds,
  getCurrentUserPlaylists
} from './actions';
import * as APIService from './api';
import { currentUserSelector } from './selectors';
import { StateObservable } from 'redux-observable';

export const getCurrentUserEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getCurrentUser.request)),
    switchMap(() =>
      from(APIService.fetchCurrentUser()).pipe(
        map(v => getCurrentUser.success(v)),
        catchError(error => of(getCurrentUser.failure({ error })))
      )
    )
  );

export const getCurrentUserFollowingIdsEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUserFollowingsIds.request)),
    withLatestFrom(state$),
    switchMap(getCurrentUserFromState(state$)),
    switchMap(([, userId]) =>
      from(APIService.fetchUserFollowingIds(userId as number)).pipe(
        // Map array to object with booleans for performance
        map(mapToObject),
        map(v => getCurrentUserFollowingsIds.success(v)),
        catchError(error => of(getCurrentUserFollowingsIds.failure({ error })))
      )
    )
  );

export const getCurrentUserLikeIdsEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getCurrentUserLikeIds.request)),
    mergeMap(() =>
      forkJoin(
        from(APIService.fetchLikeIds('track')).pipe(map(mapToObject)),
        from(APIService.fetchLikeIds('playlist')).pipe(map(mapToObject)),
        from(APIService.fetchLikeIds('system_playlist')).pipe(map(mapToObject))
      ).pipe(
        map(([track, playlist, systemPlaylist]) =>
          getCurrentUserLikeIds.success({
            track,
            playlist,
            systemPlaylist
          })
        ),
        catchError(error => of(getCurrentUserLikeIds.failure({ error })))
      )
    )
  );

export const getCurrentUserRepostIdsEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getCurrentUserRepostIds.request)),
    mergeMap(() =>
      forkJoin(
        from(APIService.fetchRepostIds('track')).pipe(map(mapToObject)),
        from(APIService.fetchRepostIds('playlist')).pipe(map(mapToObject))
      ).pipe(
        map(([track, playlist]) =>
          getCurrentUserRepostIds.success({
            track,
            playlist
          })
        ),
        catchError(error => of(getCurrentUserRepostIds.failure({ error })))
      )
    )
  );

export const getCurrentUserPlaylistsEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getCurrentUserPlaylists.request)),
    switchMap(() =>
      from(APIService.fetchPlaylists()).pipe(
        map(response => {
          const likedPlaylistIds = response.normalized.result
            .filter(playlist => playlist.type === 'playlist-like')
            .map(
              (playlist): Normalized.NormalizedResult => ({
                id: +playlist.playlist,
                schema: 'playlists'
              })
            );

          const playlistIds = response.normalized.result
            .filter(playlist => playlist.type === 'playlist')
            .map(
              (playlist): Normalized.NormalizedResult => ({
                id: +playlist.playlist,
                schema: 'playlists'
              })
            );

          return getCurrentUserPlaylists.success({
            liked: likedPlaylistIds,
            owned: playlistIds,
            entities: response.normalized.entities
          });
        }),
        catchError(error => of(getCurrentUserPlaylists.failure({ error })))
      )
    )
  );

// Helpers

const getCurrentUserFromState = (state$: StateObservable<RootState>) => ([action, state]: [
  EmptyAction<any>,
  RootState
]) => {
  const currentUser = currentUserSelector(state);

  if (currentUser?.id) {
    return of([action, currentUser?.id]);
  }

  return state$.pipe(
    mergeMap(latestState => {
      const userId = currentUserSelector(latestState)?.id;

      return userId ? of([action, userId]) : empty();
    }),
    first()
  );
};

const mapToObject = (v: { collection: number[] }) =>
  v.collection.reduce<ObjectMap>((acc, value) => ({ ...acc, [value.toString()]: true }), {});
