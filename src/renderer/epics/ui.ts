import { routerActions } from 'connected-react-router';
import { of } from 'rxjs';
import { debounceTime, filter, map, pluck, switchMap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { getSearchPlaylist, setDebouncedSearchQuery, setSearchQuery } from '../../common/store/actions';
import { RootEpic } from '../../common/store/declarations';
import { PlaylistTypes } from '../../common/store/types';

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

export const successNotificationEpic: RootEpic = (action$, state$) =>
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
