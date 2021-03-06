import { EpicError, handleEpicError } from '@common/utils/errors/EpicError';
import { Normalized, ObjectMap, SoundCloud } from '@types';
import { StoreState, _StoreState } from 'AppReduxTypes';
import { StateObservable } from 'redux-observable';
import { defer, EMPTY, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, filter, first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EmptyAction, isActionOf } from 'typesafe-actions';
import {
  addErrorToast,
  addInfoToast,
  addSuccessToast,
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserPlaylists,
  getCurrentUserRepostIds,
  toggleLike,
  toggleRepost
} from '../../common/store/actions';
import { RootEpic } from '../../common/store/declarations';
import { getPlayingTrackSelector } from '../../common/store/player/selectors';
import { currentUserSelector, getMusicEntity, hasLiked, hasReposted } from '../../common/store/selectors';
import { LikeType, RepostType } from '../../common/store/types';
import { toggleFollowing, ToggleLikeRequestPayload, ToggleRepostRequestPayload } from '../../common/store/auth/actions';
import * as APIService from '../../common/store/auth/api';
import { isFollowing } from '../../common/store/auth/selectors';
import { lowerFirst } from 'lodash';
import { Action } from 'redux';

export const getCurrentUserEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUser.request)),
    switchMap(() =>
      defer(() => from(APIService.fetchCurrentUser())).pipe(
        map((v) => getCurrentUser.success(v)),
        catchError(handleEpicError(action$, (error) => of(getCurrentUser.failure(error))))
      )
    )
  );

export const getCurrentUserFollowingIdsEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUserFollowingsIds.request)),
    withLatestFrom(state$),
    switchMap(getCurrentUserFromState(state$)),
    switchMap(([, userId]) =>
      defer(() => from(APIService.fetchUserFollowingIds(userId as number))).pipe(
        // Map array to object with booleans for performance
        map(mapToObject),
        map((v) => getCurrentUserFollowingsIds.success(v)),
        catchError(handleEpicError(action$, (error) => of(getCurrentUserFollowingsIds.failure(error))))
      )
    )
  );

export const getCurrentUserLikeIdsEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUserLikeIds.request)),
    mergeMap(() =>
      defer(() =>
        forkJoin([
          from(APIService.fetchLikeIds('track')).pipe(map(mapToObject)),
          from(APIService.fetchLikeIds('playlist')).pipe(map(mapToObject)),
          from(APIService.fetchLikeIds('system_playlist')).pipe(map(mapToObject))
        ])
      ).pipe(
        map(([track, playlist, systemPlaylist]) =>
          getCurrentUserLikeIds.success({
            track,
            playlist,
            systemPlaylist
          })
        ),
        catchError(handleEpicError(action$, (error) => of(getCurrentUserLikeIds.failure(error))))
      )
    )
  );

export const getCurrentUserRepostIdsEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUserRepostIds.request)),
    mergeMap(() =>
      defer(() =>
        forkJoin([
          from(APIService.fetchRepostIds('track')).pipe(map(mapToObject)),
          from(APIService.fetchRepostIds('playlist')).pipe(map(mapToObject))
        ])
      ).pipe(
        map(([track, playlist]) =>
          getCurrentUserRepostIds.success({
            track,
            playlist
          })
        ),
        catchError(handleEpicError(action$, (error) => of(getCurrentUserRepostIds.failure(error))))
      )
    )
  );

export const getCurrentUserPlaylistsEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getCurrentUserPlaylists.request)),
    switchMap(() =>
      defer(() => from(APIService.fetchPlaylists())).pipe(
        map((response) => {
          const likedPlaylistIds = response.normalized.result
            .filter((playlist) => playlist.type === 'playlist-like')
            .map(
              (playlist): Normalized.NormalizedResult => ({
                id: +playlist.playlist,
                schema: 'playlists'
              })
            );

          const playlistIds = response.normalized.result
            .filter((playlist) => playlist.type === 'playlist')
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
        catchError(handleEpicError(action$, (error) => of(getCurrentUserPlaylists.failure(error))))
      )
    )
  );

export const toggleLikeEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleLike.request)),
    withLatestFrom(state$),
    // If no payload is set, use the current playing track
    map(([{ payload }, state]) => {
      const playingTrack = getPlayingTrackSelector(state);
      const fallbackPayload = {
        id: playingTrack?.id,
        type: LikeType.Track
      };

      return {
        payload: !Object.keys(payload).length && playingTrack ? fallbackPayload : payload,
        state
      };
    }),
    filter<{
      payload: ToggleLikeRequestPayload;
      state: _StoreState;
    }>(({ payload }) => !!(payload && payload.id && payload.type)),
    map(({ payload, state }) => {
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

      return defer(() => {
        let ob$;

        switch (type) {
          case LikeType.Track:
            ob$ = APIService.toggleTrackLike({ trackId: id, like: !isLiked });
            break;
          case LikeType.Playlist:
            ob$ = APIService.togglePlaylistLike({ playlistId: id, like: !isLiked });
            break;
          case LikeType.SystemPlaylist:
            ob$ = APIService.toggleSystemPlaylistLike({ playlistUrn: id.toString(), userId, like: !isLiked });
            break;
          default:
            ob$ = throwError(new EpicError(`${type}: Unknown type found`));
        }

        return ob$;
      }).pipe(
        withLatestFrom(state$),
        mergeMap(([_, state]) => {
          const trackOrPlaylist = getMusicEntity<SoundCloud.Track | SoundCloud.Playlist>({
            id: +id,
            schema: type === LikeType.Track ? 'tracks' : 'playlists'
          })(state);

          const successActions: Action[] = [
            toggleLike.success({
              id,
              type,
              liked: !isLiked
            })
          ];

          if (!isLiked) {
            successActions.push(
              addInfoToast({
                title: trackOrPlaylist?.title ?? 'Liked',
                message: `This ${type} was ${!isLiked ? 'added to' : 'removed from'} your library`,
                options: {
                  timeOut: 2000
                }
              })
            );
          }

          return successActions;
        }),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              toggleLike.failure({
                id,
                type,
                liked: !isLiked,
                error
              }),
              addErrorToast({
                title: `Error occurred while ${!isLiked ? 'liking' : 'unliking'}`,
                message: `Please try again later`
              })
            )
          )
        )
      );
    })
  );

export const toggleRepostEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleRepost.request)),
    withLatestFrom(state$),
    // If no payload is set, use the current playing track
    map(([{ payload }, state]) => {
      const playingTrack = getPlayingTrackSelector(state);
      const fallbackPayload = {
        id: playingTrack?.id,
        type: RepostType.Track
      };

      return {
        payload: !Object.keys(payload).length && playingTrack ? fallbackPayload : payload,
        state
      };
    }),
    filter<{
      payload: ToggleRepostRequestPayload;
      state: _StoreState;
    }>(({ payload }) => !!(payload && payload.id && payload.type)),

    map(({ payload, state }) => {
      const isReposted = hasReposted(payload.id, payload.type)(state);

      return {
        payload,
        isReposted
      };
    }),
    switchMap(({ payload, isReposted }) => {
      const { id, type } = payload;
      const repost = !isReposted;

      return defer(() => {
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
        return ob$;
      }).pipe(
        withLatestFrom(state$),
        mergeMap(([_, state]) => {
          const trackOrPlaylist = getMusicEntity<SoundCloud.Track | SoundCloud.Playlist>({
            id: +id,
            schema: type === RepostType.Track ? 'tracks' : 'playlists'
          })(state);

          const successActions: Action[] = [
            toggleRepost.success({
              id,
              type,
              reposted: repost
            })
          ];

          if (!isReposted) {
            successActions.push(
              addInfoToast({
                title: trackOrPlaylist?.title ?? 'Liked',
                message: `This ${type} was reposted to your stream`,
                options: {
                  timeOut: 2000
                }
              })
            );
          }

          return successActions;
        }),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              toggleRepost.failure({
                id,
                type,
                reposted: repost,
                error
              }),
              addErrorToast({
                title: `Error occurred while ${!isReposted ? 'reposting' : 'removing repost'}`,
                message: `Please try again later`
              })
            )
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

      return defer(() => from(APIService.toggleFollowing({ userId, follow }))).pipe(
        map(() =>
          toggleFollowing.success({
            userId,
            follow
          })
        ),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              toggleFollowing.failure({
                userId,
                follow,
                error
              }),
              addErrorToast({
                title: `Error occurred while ${!isFollowingUser ? 'following' : 'unfollowing'} artist`,
                message: `Please try again later`
              })
            )
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
    mergeMap((latestState) => {
      const userId = currentUserSelector(latestState)?.id;

      return userId ? of([action, userId]) : EMPTY;
    }),
    first()
  );
};

const mapToObject = (v: { collection: number[] }) =>
  v.collection.reduce<ObjectMap>((acc, value) => ({ ...acc, [value.toString()]: true }), {});
