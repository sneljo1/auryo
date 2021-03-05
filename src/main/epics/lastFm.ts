import {
  connectLastFm,
  playTrack,
  receiveProtocolAction,
  setConfigKey,
  setCurrentTime,
  toggleLike
} from '@common/store/actions';
import { LikeType } from '@common/store/auth';
import { RootEpic } from '@common/store/declarations';
import { getPlayerDuration, getPlayingTrackSelector, getTrackEntity, lastFmSelector } from '@common/store/selectors';
import { handleEpicError } from '@common/utils/errors/EpicError';
import { Logger } from '@main/utils/logger';
import { Utils } from '@main/utils/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { shell } from 'electron';
import LastFMTyped from 'lastfm-typed';
import * as querystring from 'querystring';
import { EMPTY, from, ObservableInput, of } from 'rxjs';
import {
  catchError,
  filter,
  ignoreElements,
  map,
  mergeMap,
  pluck,
  switchMap,
  take,
  takeUntil,
  tap,
  timeout,
  withLatestFrom
} from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { CONFIG } from '../../config';

const logger = Logger.createLogger('EPIC/main/lastfm');

const lastFm = new LastFMTyped(CONFIG.LASTFM_API_KEY ?? '', {
  apiSecret: CONFIG.LASTFM_API_SECRET,
  userAgent: 'auryo'
});

export const connectLastFmEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(connectLastFm.request)),
    tap(() => {
      const queryParams = querystring.stringify({
        api_key: CONFIG.LASTFM_API_KEY,
        cb: 'auryo://lastfm-auth'
      });

      shell.openExternal(`http://www.last.fm/api/auth/?${queryParams}`);
    }),
    // Initialize flow
    switchMap(() =>
      action$.pipe(
        filter(isActionOf(receiveProtocolAction)),
        takeUntil(
          action$.pipe(filter(isActionOf([connectLastFm.failure, connectLastFm.request, connectLastFm.success])))
        ),
        pluck('payload'),
        filter(({ action }) => action === 'lastfm-auth'),
        // 5 minute timeout
        timeout(60000 * 5),
        switchMap(({ params: { token } }) =>
          from(lastFm.auth.getSession(token as string)).pipe(
            mergeMap((session) => {
              // TODO: notification
              return of(
                setConfigKey('lastfm.key', session.key),
                setConfigKey('lastfm.user', session.name),
                connectLastFm.success({})
              );
            })
          )
        ),
        catchError(handleEpicError(action$, connectLastFm.failure))
      )
    )
  );

const handleLastFmError = (error: any, _source: ObservableInput<any>) => {
  logger.error(error);

  // Invalid session key - Please re-authenticate
  // TODO: 11 & 16 should be retried
  // https://www.last.fm/api/scrobbling
  if (error?.response?.error === 9) {
    // TODO: Show notification with link to reconnect?
    // It may be nice to have an onClick, but we will have to find another
    // way to create the notification as we cannot serialize onClick

    return of(setConfigKey('lastfm', null));
  }

  return EMPTY;
};

export const scrobbleEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(playTrack.success)),
    withLatestFrom(state$),
    map(([_, state]) => ({ lastFmConfig: lastFmSelector(state) })),
    filter(({ lastFmConfig }) => !!lastFmConfig?.key),
    switchMap(({ lastFmConfig }) =>
      action$.pipe(
        filter(isActionOf(setCurrentTime)),
        takeUntil(action$.pipe(filter(isActionOf([playTrack.success])))),
        pluck('payload'),
        withLatestFrom(state$),
        map(([currentTime, state]) => {
          const playingTrack = getPlayingTrackSelector(state);

          return {
            currentTime,
            duration: getPlayerDuration(state),
            track: getTrackEntity(playingTrack?.id as number)(state)
          };
        }),
        filter(
          ({ currentTime, duration, track }) =>
            !!track &&
            duration > 30 && // should be longer than 30s according to lastfm
            (currentTime / duration > 0.5 || // should have exceeded 1/2 of the song
              currentTime > 60 * 4) // or passed 4 minutes, whichever comes first
        ),
        take(1),
        mergeMap(({ currentTime, duration, track }) => {
          const { title, artist } = Utils.cleanInfo(track as any);

          logger.trace({ title, artist }, 'Scrobble');

          return from(
            lastFm.track.scrobble(lastFmConfig?.key as string, [
              {
                artist,
                timestamp: Math.round(Date.now() / 1000 - currentTime),
                track: title,
                duration
              }
            ])
          ).pipe(ignoreElements(), catchError(handleLastFmError));
        })
      )
    )
  );

export const updateNowPlayingEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(playTrack.success)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      lastFmConfig: lastFmSelector(state),
      track: getTrackEntity(payload.idResult.id)(state)
    })),
    filter(({ lastFmConfig, track }) => !!lastFmConfig?.key && !!track),
    switchMap(({ lastFmConfig, track }) => {
      const { title, artist } = Utils.cleanInfo(track as any);

      logger.trace({ title, artist }, 'updateNowPlaying');

      return from(
        lastFm.track.updateNowPlaying(artist, title, lastFmConfig?.key as string, { duration: track?.duration })
      ).pipe(ignoreElements(), catchError(handleLastFmError));
    })
  );

export const updateTrackLoveEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleLike.success)),
    pluck('payload'),
    filter(({ type }) => type === LikeType.Track),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      liked: payload.liked,
      lastFmConfig: lastFmSelector(state),
      track: getTrackEntity(payload.id)(state)
    })),
    filter(({ lastFmConfig, track }) => !!lastFmConfig?.key && !!track),
    switchMap(({ lastFmConfig, track, liked }) => {
      const { title, artist } = Utils.cleanInfo(track as any);

      logger.trace({ title, artist }, 'updateTrackLove');

      let ob$;

      if (liked) {
        ob$ = from(lastFm.track.love(artist, title, lastFmConfig?.key as string));
      } else {
        ob$ = from(lastFm.track.unlove(artist, title, lastFmConfig?.key as string));
      }

      return ob$.pipe(ignoreElements(), catchError(handleLastFmError));
    })
  );
