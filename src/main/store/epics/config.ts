import { setConfig, setConfigKey } from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { settings } from '@main/settings';
import { Logger } from '@main/utils/logger';
import { debounceTime, filter, ignoreElements, map, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

const logger = Logger.createLogger('EPIC/main/config');

export const saveSettingsEpic: RootEpic = (action$, state$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf([setConfigKey, setConfig])),
    withLatestFrom(state$),
    debounceTime(500),
    map(([, state]) => state.config),
    tap(latestConfig => settings.set(latestConfig)),
    tap(() => logger.trace('Settings saved')),
    ignoreElements()
  );