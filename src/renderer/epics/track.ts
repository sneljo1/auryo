import { normalizeArray, normalizeCollection } from '@common/schemas';
import { SC } from '@common/utils';
import { handleEpicError } from '@common/utils/errors/EpicError';
import { SoundCloud } from '@types';
import { defer, from, of } from 'rxjs';
import { catchError, filter, map, pluck, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { commentsFetchMore, getComments, getTrack, setCommentsLoading } from '../../common/store/actions';
import { fetchFromUrl } from '../../common/store/api';
import { RootEpic } from '../../common/store/declarations';
import { getCommentObject } from '../../common/store/selectors';
import { ObjectTypes } from '../../common/store/types';
import * as APIService from '../../common/store/track/api';

export const getTrackEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getTrack.request)),
    tap((action) => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ trackId, refresh }) => {
      return defer(() => from(APIService.fetchTrack({ trackId }))).pipe(
        map((track) => normalizeArray<SoundCloud.Track>([track])),
        map((data) =>
          getTrack.success({
            trackId,
            entities: data.normalized.entities
          })
        ),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              getTrack.failure({
                trackId,
                error
              })
            )
          )
        )
      );
    })
  );

export const getCommentsEpic: RootEpic = (action$) =>
  action$.pipe(
    filter(isActionOf(getComments.request)),
    tap((action) => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ trackId, refresh }) => {
      return defer(() => from(APIService.fetchComments({ trackId }))).pipe(
        map((data) => normalizeCollection<SoundCloud.Comment>(data)),
        map((data) =>
          getComments.success({
            trackId,
            objectType: ObjectTypes.COMMENTS,
            entities: data.normalized.entities,
            result: data.normalized.result,
            refresh,
            nextUrl: data.json?.next_href
          })
        ),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              getComments.failure({
                trackId,
                error
              })
            )
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

      return defer(() => from(fetchFromUrl<any>(urlWithToken))).pipe(
        map((data) => normalizeCollection<SoundCloud.Comment>(data)),
        map((data) =>
          commentsFetchMore.success({
            trackId,
            entities: data.normalized.entities,
            objectType: ObjectTypes.COMMENTS,
            result: data.normalized.result,
            nextUrl: data.json?.next_href
          })
        ),
        catchError(
          handleEpicError(action$, (error) =>
            of(
              commentsFetchMore.failure({
                trackId,
                error
              })
            )
          )
        ),
        startWith(setCommentsLoading({ trackId }))
      );
    })
  );
