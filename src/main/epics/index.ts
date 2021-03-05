import { RootEpic } from '@common/store/declarations';
import { handleUncaughtErrors } from '@common/utils/errors/EpicError';
import { combineEpics } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import * as app from './app';
import * as auth from './auth';
import * as config from './config';
import * as lastFm from './lastFm';

export const mainRootEpic: RootEpic = (action$, state$) =>
  combineEpics(
    ...Object.values(config),
    ...Object.values(auth),
    ...Object.values(app),
    ...Object.values(lastFm)
  )(action$, state$, undefined)
    // Global error handling
    .pipe(catchError(handleUncaughtErrors));
