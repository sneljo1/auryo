import { copyToClipboard, openExternalUrl, restartApp } from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { Logger } from '@main/utils/logger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, clipboard, shell } from 'electron';
import { filter, ignoreElements, pluck, tap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

const logger = Logger.createLogger('EPIC/main/app');

export const copyToClipboardEpic: RootEpic = action$ =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(copyToClipboard)),
    pluck('payload'),
    tap(text => clipboard.writeText(text)),
    ignoreElements()
  );

export const openExternalEpic: RootEpic = action$ =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(openExternalUrl)),
    pluck('payload'),
    tap(url => shell.openExternal(url).catch(logger.error)),
    ignoreElements()
  );

export const restartAppEpic: RootEpic = action$ =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(restartApp)),
    pluck('payload'),
    tap(() => {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      app.exit(0);
    }),
    ignoreElements()
  );
