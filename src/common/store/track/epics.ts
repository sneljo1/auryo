import { normalizeArray, normalizeCollection } from '@common/schemas';
import { SC } from '@common/utils';
import { SoundCloud } from '@types';
import { AxiosError } from 'axios';
import { from, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, tap, withLatestFrom, pluck } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { commentsFetchMore, getComments, getTrack, setCommentsLoading } from '../actions';
import { fetchFromUrl } from '../api';
import { RootEpic } from '../declarations';
import { getCommentObject } from '../selectors';
import { ObjectTypes } from '../types';
import * as APIService from './api';

const handleEpicError = (error: any) => {
  if ((error as AxiosError).isAxiosError) {
    console.log(error.message, error.response.data);
  } else {
    console.error('Epic error - track', error);
  }
  // TODO Sentry?
  return error;
};

export const getTrackEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getTrack.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ trackId, refresh }) => {
      return from(APIService.fetchTrack({ trackId })).pipe(
        map(track => normalizeArray<SoundCloud.Track>([track])),
        map(data =>
          getTrack.success({
            trackId,
            entities: data.normalized.entities
          })
        ),
        catchError(error =>
          of(
            getTrack.failure({
              error: handleEpicError(error),
              trackId
            })
          )
        )
      );
    })
  );

export const getCommentsEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getComments.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ trackId, refresh }) => {
      return from(APIService.fetchComments({ trackId })).pipe(
        map(data => normalizeCollection<SoundCloud.Comment>(data)),
        map(data =>
          getComments.success({
            trackId,
            objectType: ObjectTypes.COMMENTS,
            entities: data.normalized.entities,
            result: data.normalized.result,
            refresh,
            nextUrl: data.json?.['next_href']
          })
        ),
        catchError(error =>
          of(
            getComments.failure({
              error: handleEpicError(error),
              trackId
            })
          )
        )
      );
    })
  );

export const commentsFetchMoreEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(commentsFetchMore.request)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const object = getCommentObject(payload.trackId)(state);

      return {
        payload,
        object
      };
    }),
    // Don't do anything if we are already fetching this
    filter(({ object }) => !!object && !object.isFetching && !!object.nextUrl),
    switchMap(({ object, payload }) => {
      const { trackId } = payload;
      const urlWithToken = SC.appendToken(object?.nextUrl as string);

      return from(fetchFromUrl<any>(urlWithToken)).pipe(
        map(data => normalizeCollection<SoundCloud.Comment>(data)),
        map(data =>
          commentsFetchMore.success({
            trackId,
            entities: data.normalized.entities,
            objectType: ObjectTypes.COMMENTS,
            result: data.normalized.result,
            nextUrl: data.json?.['next_href']
          })
        ),
        catchError(error =>
          of(
            commentsFetchMore.failure({
              error: handleEpicError(error),
              trackId
            })
          )
        ),
        startWith(setCommentsLoading({ trackId }))
      );
    })
  );
