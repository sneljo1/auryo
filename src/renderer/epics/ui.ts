import { routerActions } from 'connected-react-router';
import { of } from 'rxjs';
import { debounceTime, filter, map, switchMap, withLatestFrom, pluck } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { PlaylistTypes } from '../../common/store/types';
import {
  setDebouncedDimensions,
  setDebouncedSearchQuery,
  setDimensions,
  setSearchQuery,
  getSearchPlaylist
} from '../../common/store/actions';
import { RootEpic } from '../../common/store/declarations';

export const setDebouncedDimensionsEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(setDebouncedDimensions)),
    debounceTime(500),
    pluck('payload'),
    map((payload) => setDimensions(payload))
  );

export const setDebouncedSearchQueryEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(setDebouncedSearchQuery)),
    debounceTime(250),
    pluck('payload'),
    map((query) =>
      setSearchQuery({
        query
      })
    )
  );

export const setSearchQueryEpic: RootEpic = (action$, state$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(setSearchQuery)),
    pluck('payload'),
    withLatestFrom(state$),
    switchMap(([{ query, noNavigation }, state]) => {
      const {
        router: { location }
      } = state;

      const navigateToSearch: any[] = [];

      if (!noNavigation && !location.pathname.startsWith('/search')) {
        navigateToSearch.push(routerActions.replace('/search'));
      }

      const playlistType = (location.pathname.split('/search/')?.[1] as PlaylistTypes | null) || PlaylistTypes.SEARCH;

      return of(getSearchPlaylist({ query, playlistType, refresh: true }), ...navigateToSearch);
    })
  );
