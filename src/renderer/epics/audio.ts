import {
  addErrorToast,
  initApp,
  logout,
  playTrack,
  restartTrack,
  seekTo,
  setConfigKey,
  setCurrentTime,
  toggleStatus,
  trackFinished
} from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { audioConfigSelector, getPlayerStatusSelector } from '@common/store/selectors';
import { fetchStreams } from '@common/store/track/api';
import { PlayerStatus } from '@common/store/types';
import { handleEpicError } from '@common/utils/errors/EpicError';
import { defer, EMPTY, of } from 'rxjs';
import { AudioStream } from 'rxjs-audio';
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  ignoreElements,
  map,
  mapTo,
  pluck,
  switchMap,
  tap,
  throttleTime,
  withLatestFrom
} from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

const audio = new AudioStream({ autoPlay: true });

export const initializeAudioStreamEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(initApp)),
    withLatestFrom(state$),
    map(([_, state]) => audioConfigSelector(state)),
    tap((audoConfig) => {
      audio.setVolume(audoConfig.volume);
      audio.setMute(audoConfig.muted);
      audio.setSinkId(audoConfig.playbackDeviceId);
    }),
    ignoreElements()
  );

export const stopAudioStreamEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf([logout])),
    tap(() => {
      audio.stop();
    }),
    ignoreElements()
  );

export const audioStreamErrorEpic: RootEpic = () =>
  // @ts-expect-error
  audio
    .events()
    .pipe(
      // @ts-expect-error
      filter((event) => event.type === 'error')
    )
    .pipe(
      // @ts-expect-error
      exhaustMap((error) => {
        console.error('Audio error', error);

        switch (error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            // Retry?
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            return of(
              addErrorToast({
                title: 'Track failed to play',
                message: 'Please try again, if the problem persist, we may not be able to play this.'
              })
            );
            break;
          case MediaError.MEDIA_ERR_DECODE:
          default:
            return of(
              addErrorToast({
                title: 'Track failed to play',
                message: 'An error occured while playing this track.'
              })
            );
        }

        return EMPTY;
      })
    );

export const loadTrackOnPlayEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(playTrack.success)),
    pluck('payload'),
    switchMap(({ idResult }) =>
      defer(() => fetchStreams({ trackId: idResult.id })).pipe(
        tap((streams) => {
          audio.loadTrack(streams.http_mp3_128_url);
        }),
        ignoreElements(),
        catchError(handleEpicError(action$))
      )
    )
  );

export const toggleStatusEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(toggleStatus)),
    withLatestFrom(state$),
    map(([_, state]) => getPlayerStatusSelector(state)),
    map((newStatus) => {
      switch (newStatus) {
        case PlayerStatus.PLAYING:
          audio.play();
          break;
        case PlayerStatus.PAUSED:
          audio.pause();
          break;
        case PlayerStatus.STOPPED:
          audio.stop();
          break;
        default:
      }
    }),
    ignoreElements()
  );

export const restartTrackEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(restartTrack)),
    tap(() => {
      audio.stop();
      audio.play();
    }),
    ignoreElements()
  );

const canPlay$ = audio.events().pipe(
  // @ts-expect-error
  filter((event) => event.type === 'canplay')
);
const ended$ = audio.events().pipe(
  // @ts-expect-error
  filter((event: Event) => event.type === 'ended')
);

export const trackFinishedEpic: RootEpic = () =>
  // @ts-expect-error
  canPlay$.pipe(switchMap(() => ended$)).pipe(mapTo(trackFinished()));

export const trackCurrentPositionEpic: RootEpic = () =>
  // @ts-expect-error
  audio.getState().pipe(
    // @ts-expect-error
    pluck('trackInfo', 'currentTime'),
    filter((currentTime) => currentTime != null),
    map((currentTime) => Math.ceil(currentTime)),
    distinctUntilChanged(),
    exhaustMap((currentTime) => of(setCurrentTime(currentTime)))
    // takeUntil(action$.pipe(filter(isActionOf(seekTo))))
  );

export const changeVolumeEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(setConfigKey)),
    pluck('payload'),
    throttleTime(100),
    filter(({ key }) => key === 'audio.volume'),
    tap(({ value: volume }) => {
      audio.setVolume(volume);
    }),
    ignoreElements()
  );

export const setMuteEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(setConfigKey)),
    pluck('payload'),
    filter(({ key }) => key === 'audio.muted'),
    tap(({ value: muted }) => {
      audio.setMute(muted);
    }),
    ignoreElements()
  );

export const setSinkEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(setConfigKey)),
    pluck('payload'),
    filter(({ key }) => key === 'audio.playbackDeviceId'),
    tap(({ value: playbackDeviceId }) => {
      audio.setSinkId(playbackDeviceId);
    }),
    ignoreElements()
  );

export const seekToEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(seekTo)),
    pluck('payload'),
    exhaustMap((value) => {
      audio.seekTo(value);
      return of(setCurrentTime(value));
    })
  );
