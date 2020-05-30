import { EpicError } from '@common/utils/errors/EpicError';
import { Normalized, ObjectMap } from '@types';
import { StoreState } from 'AppReduxTypes';
import { AxiosError } from 'axios';
import { StateObservable } from 'redux-observable';
import { empty, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { EmptyAction, isActionOf } from 'typesafe-actions';
import {
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserPlaylists,
  getCurrentUserRepostIds,
  toggleLike,
  toggleRepost
} from '../actions';
import { RootEpic } from '../declarations';
import { currentUserSelector, hasLiked, hasReposted } from '../selectors';
import { LikeType, RepostType } from '../types';
import * as APIService from './api';
import { toggleFollowing } from './actions';
import { isFollowing } from './selectors';

const handleEpicError = (error: any) => {
  if ((error as AxiosError).isAxiosError) {
    console.log(error.message, error.response.data);
  } else {
    console.error('Epic error - track', error);
  }
  // TODO Sentry?
  return error;
};

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

// TODO: add toaster for success and erro
export const toggleLikeEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleLike.request)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const isLiked = hasLiked(payload.id, payload.type)(state);
      const currentUser = currentUserSelector(state);

      return {
        payload,
        isLiked,
        userId: currentUser?.id as number
      };
    }),
    switchMap(({ payload, isLiked, userId }) => {
      const { id, type } = payload;

      let ob$;

      switch (type) {
        case LikeType.Track:
          ob$ = APIService.toggleTrackLike({ trackId: id, userId, like: !isLiked });
          break;
        case LikeType.Playlist:
          ob$ = APIService.togglePlaylistLike({ playlistId: id, userId, like: !isLiked });
          break;
        case LikeType.SystemPlaylist:
          ob$ = APIService.toggleSystemPlaylistLike({ playlistUrn: id.toString(), userId, like: !isLiked });
          break;
        default:
          ob$ = throwError(new EpicError(`${type}: Unknown type found`));
      }

      return from(ob$).pipe(
        map(() =>
          toggleLike.success({
            id,
            type,
            liked: !isLiked
          })
        ),
        catchError(error =>
          of(
            toggleLike.failure({
              error: handleEpicError(error),
              id,
              type,
              liked: !isLiked
            })
          )
        )
      );
    })
  );

// TODO: add toaster for success and error
export const toggleRepostEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleRepost.request)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const isReposted = hasReposted(payload.id, payload.type)(state);

      return {
        payload,
        isReposted
      };
    }),
    switchMap(({ payload, isReposted }) => {
      const { id, type } = payload;
      const repost = !isReposted;

      let ob$;

      switch (type) {
        case RepostType.Track:
          ob$ = APIService.toggleTrackRepost({ trackId: id, repost });
          break;
        case RepostType.Playlist:
          ob$ = APIService.togglePlaylistRepost({ playlistId: id, repost });
          break;
        default:
          ob$ = throwError(new EpicError(`${type}: Unknown type found`));
      }

      return from(ob$).pipe(
        map(() =>
          toggleRepost.success({
            id,
            type,
            reposted: repost
          })
        ),
        catchError(error =>
          of(
            toggleRepost.failure({
              error: handleEpicError(error),
              id,
              type,
              reposted: repost
            })
          )
        )
      );
    })
  );

export const toggleFollowingEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleFollowing.request)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const isFollowingUser = isFollowing(payload.userId)(state);

      return {
        payload,
        isFollowingUser
      };
    }),
    switchMap(({ payload, isFollowingUser }) => {
      const { userId } = payload;
      const follow = !isFollowingUser;

      return from(APIService.toggleFollowing({ userId, follow })).pipe(
        map(() =>
          toggleFollowing.success({
            userId,
            follow
          })
        ),
        catchError(error =>
          of(
            toggleFollowing.failure({
              error: handleEpicError(error),
              userId,
              follow
            })
          )
        )
      );
    })
  );

// Helpers

const getCurrentUserFromState = (state$: StateObservable<StoreState>) => ([action, state]: [
  EmptyAction<any>,
  StoreState
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
