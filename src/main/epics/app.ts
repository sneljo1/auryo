import { copyToClipboard, openExternalUrl, playTrack, restartApp } from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { appConfigSelector, getTrackEntity } from '@common/store/selectors';
import { Logger } from '@main/utils/logger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, clipboard, shell } from 'electron';
import { filter, ignoreElements, map, pluck, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import fs from 'fs';
import { Utils } from '@main/utils/utils';

const logger = Logger.createLogger('EPIC/main/app');

export const copyToClipboardEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(copyToClipboard)),
    pluck('payload'),
    tap((text) => clipboard.writeText(text)),
    ignoreElements()
  );

export const openExternalEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(openExternalUrl)),
    pluck('payload'),
    tap((url) => shell.openExternal(url).catch(logger.error)),
    ignoreElements()
  );

export const restartAppEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(restartApp)),
    pluck('payload'),
    tap(() => {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      app.exit(0);
    }),
    ignoreElements()
  );

export const logTrackChangeEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(playTrack.success)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      appConfig: appConfigSelector(state),
      track: getTrackEntity(payload.idResult.id)(state)
    })),
    filter(({ appConfig }) => appConfig.logTrackChange),
    tap(({ track }) => {
      let content = '';

      if (track) {
        const { title, artist } = Utils.cleanInfo(track);

        content = `${title}\n${artist}`;
      }

      fs.writeFileSync('/tmp/auryo_current_track.log', content);
    }),
    ignoreElements()
  );
