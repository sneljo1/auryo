import { logout, tokenRefresh } from '@common/store/actions';
import { Logger } from '@main/utils/logger';
import { RootAction } from 'AppReduxTypes';
import { Action } from 'redux';
import { ActionsObservable } from 'redux-observable';
import { EMPTY, Observable, ObservableInput, of } from 'rxjs';
import { filter, mergeMapTo, startWith, take, takeUntil } from 'rxjs/operators';
import { serializeError } from 'serialize-error';
import { isActionOf } from 'typesafe-actions';

export class EpicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EpicError';
  }

  public toJSON() {
    return serializeError(this);
  }
}

const logger = Logger.createLogger('EPIC');

type ErrorCallback<A> = (error: any) => A;

export const handleEpicError = <A extends Observable<Action<any>>>(
  action$: ActionsObservable<RootAction>,
  actionOnFail?: A | ErrorCallback<A>
) => (error: any, source: ObservableInput<any>) => {
  // Refresh token if 401
  if (error.isAxiosError && error?.response?.status === 401) {
    // TODO: should have a retryCount
    return action$.pipe(
      filter(isActionOf(tokenRefresh.success)),
      takeUntil(action$.pipe(filter(isActionOf([tokenRefresh.failure, logout])))),
      take(1),
      mergeMapTo(source),
      startWith(tokenRefresh.request({}))
    );
  }

  if (actionOnFail) {
    logger.error(error);

    if (typeof actionOnFail === 'function') {
      return actionOnFail(error);
    }

    // TODO Sentry?
    return actionOnFail;
  }

  logger.error(error, 'handleEpicError');

  return EMPTY;
};

export const handleUncaughtErrors = (error: any, source: ObservableInput<any>) => {
  // if (error.xhr) {
  //   const errorActionCreator = ERRORS_MAP[error.status];

  //   return concat(
  //     of(error).pipe(delay(4000), map(actions.clearError), startWith(errorActionCreator(error.xhr.response))),
  //     stream
  //   );
  // }

  // Loging uncaught errors and returning stream (avoids epics to break)
  console.error('Uncaught', error);

  return source;
};
