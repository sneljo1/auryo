// import { APIService } from '@common/api';
// import { from, of } from 'rxjs';
// import { catchError, filter, map, switchMap } from 'rxjs/operators';
// import { isActionOf } from 'typesafe-actions';
// import { RootEpic } from '../types';
// import { searchAsync } from './playlists/search/actions';
// import { isSoundCloudUrl } from '@common/utils';

// export const searchEpic: RootEpic = action$ =>
//   action$.pipe(
//     filter(isActionOf(searchAsync.request)),
//     map(action => action.payload),
//     filter(({ query }) => !isSoundCloudUrl(query)),
//     switchMap(({ query }) =>
//       from(APIService.searchAll(query)).pipe(
//         map(searchAsync.success),
//         catchError(message => of(searchAsync.failure(message)))
//       )
//     )
//   );

// export const resolveSoundCloudUrl: RootEpic = action$ =>
//   action$.pipe(
//     filter(isActionOf(searchAsync.request)),
//     map(action => action.payload),
//     filter(({ query }) => isSoundCloudUrl(query)),
//     switchMap(({ query }) =>
//       from(APIService.searchAll(query)).pipe(
//         map(searchAsync.success),
//         catchError(message => of(searchAsync.failure(message)))
//       )
//     )
//   );
