import { Epic } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { setConfigKey } from '../config/actions';
import { toggleShuffle } from './actions';

export const toggleShuffleEpic: Epic = action$ =>
  action$.pipe(
    filter(isActionOf(toggleShuffle)),
    map(action => action.payload),
    map(shuffle => setConfigKey('shuffle', shuffle))
  );
