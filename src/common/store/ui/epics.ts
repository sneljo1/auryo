import { routerActions } from 'connected-react-router';
import { of } from 'rxjs';
import { debounceTime, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { PlaylistTypes } from '../objects';
import { getSearchPlaylist } from '../playlist/actions';
import { RootEpic } from '../types';
import { setDebouncedDimensions, setDebouncedSearchQuery, setDimensions, setSearchQuery } from './actions';

export const setDebouncedDimensionsEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(setDebouncedDimensions)),
    debounceTime(500),
    map(action => setDimensions(action.payload))
  );

export const setDebouncedSearchQueryEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(setDebouncedSearchQuery)),
    debounceTime(250),
    map(action =>
      setSearchQuery({
        query: action.payload
      })
    )
  );

export const setSearchQueryEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(setSearchQuery)),
    map(action => action.payload),
    withLatestFrom(state$),
    switchMap(([{ query, noNavigation }, state]) => {
      const {
        router: { location }
      } = state;

      const navigateToSearch = [];

      if (!noNavigation && !location.pathname.startsWith('/search')) {
        navigateToSearch.push(routerActions.replace('/search'));
      }

      const playlistType = (location.pathname.split('/search/')?.[1] as PlaylistTypes | null) || PlaylistTypes.SEARCH;

      return of(getSearchPlaylist({ query, playlistType, refresh: true }), ...navigateToSearch);
    })
  );
