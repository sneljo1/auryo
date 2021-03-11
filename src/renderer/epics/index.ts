import { handleUncaughtErrors } from '@common/utils/errors/EpicError';
import { combineEpics } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import { RootEpic } from '../../common/store/declarations';
import * as app from './app';
import * as appAuth from './appAuth';
import * as audio from './audio';
import * as auth from './auth';
import * as player from './player';
import * as playlist from './playlist';
import * as track from './track';
import * as ui from './ui';
import * as user from './user';

export const rootEpic: RootEpic = (action$, state$) =>
  combineEpics(
    ...Object.values(app),
    ...Object.values(appAuth),
    ...Object.values(ui),
    ...Object.values(auth),
    ...Object.values(playlist),
    ...Object.values(track),
    ...Object.values(user),
    ...Object.values(player),
    ...Object.values(audio)
  )(action$, state$, undefined)
    // Global error handling
    .pipe(catchError(handleUncaughtErrors));
