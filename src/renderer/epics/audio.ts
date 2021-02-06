import {
  initApp,
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
import { PlayerStatus } from '@common/store/types';
import { EMPTY, of } from 'rxjs';
import { AudioStream } from 'rxjs-audio';
import {
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
      console.log(audoConfig);

      audio.setVolume(audoConfig.volume);
      audio.setMute(audoConfig.muted);
      audio.setSinkId(audoConfig.playbackDeviceId);
    }),
    ignoreElements()
  );

export const audioStreamErrorEpic: RootEpic = () =>
  // @ts-expect-error
  audio
    .events()
    .pipe(filter((event) => event.type === 'error'))
    .pipe(
      exhaustMap((error) => {
        console.error('Audio error', error);

        switch (error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            // Retry?
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            return of(
              actions.addToast({
                message:
                  'We are unable to play this track. It may be that this song is not available via third party applications.',
                intent: Intent.DANGER
              })
            );
            break;
          case MediaError.MEDIA_ERR_DECODE:
          default:
            return of(
              actions.addToast({
                message: 'Something went wrong while playing this track',
                intent: Intent.DANGER
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
    tap((payload) => {
      audio.loadTrack(`http://resolve-stream/${payload.idResult.id}`);
    }),
    ignoreElements()
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

const canPlay$ = audio.events().pipe(filter((event) => event.type === 'canplay'));
const ended$ = audio.events().pipe(filter((event: Event) => event.type === 'ended'));

export const trackFinishedEpic: RootEpic = () =>
  // @ts-expect-error
  canPlay$.pipe(switchMap(() => ended$)).pipe(mapTo(trackFinished()));

export const trackCurrentPositionEpic: RootEpic = (action$) =>
  // @ts-expect-error
  audio.getState().pipe(
    pluck('trackInfo', 'currentTime'),
    filter((currentTime) => currentTime != null),
    map((currentTime) => Math.ceil(currentTime)),
    distinctUntilChanged(),
    exhaustMap((currentTime) => of(setCurrentTime(currentTime)))
    // takeUntil(action$.pipe(filter(isActionOf(seekTo))))
  );

export const changeVolumeEpic: RootEpic = (action$) =>
  // @ts-expect-error
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
  // @ts-expect-error
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
  // @ts-expect-error
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
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(seekTo)),
    pluck('payload'),
    exhaustMap((value) => {
      audio.seekTo(value);
      return of(setCurrentTime(value));
    })
  );
