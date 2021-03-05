import { setConfig, setConfigKey } from '@common/store/actions';
import { RootEpic } from '@common/store/declarations';
import { SC } from '@common/utils';
import { settings } from '@main/settings';
import { Logger } from '@main/utils/logger';
import { debounceTime, filter, ignoreElements, map, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

const logger = Logger.createLogger('EPIC/main/config');

export const saveSettingsEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf([setConfigKey, setConfig])),
    withLatestFrom(state$),
    debounceTime(500),
    map(([, state]) => state.config),
    tap((latestConfig) => {
      settings.set(latestConfig);

      if (latestConfig.auth.token) {
        SC.initialize(latestConfig.auth.token);
      }
    }),
    tap(() => logger.trace('Settings saved')),
    ignoreElements()
  );
