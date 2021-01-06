import { normalizeArray } from '@common/schemas';
import { handleEpicError } from '@common/utils/errors/EpicError';
import { EntitiesOf, SoundCloud } from '@types';
import { defer, from, of } from 'rxjs';
import { catchError, filter, map, pluck, switchMap, tap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { RootEpic } from '../declarations';
import { getUser, getUserProfiles } from './actions';
import * as APIService from './api';

export const getUserEpic: RootEpic = action$ =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(getUser.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userId, refresh }) => {
      return defer(() => from(APIService.fetchUser({ userId }))).pipe(
        map(user => normalizeArray<SoundCloud.User>([user])),
        map(data =>
          getUser.success({
            userId,
            entities: data.normalized.entities
          })
        ),
        catchError(
          handleEpicError(
            action$,
            getUser.failure({
              userId
            })
          )
        )
      );
    })
  );

export const getUserProfilesEpic: RootEpic = action$ =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(getUserProfiles.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userUrn }) => {
      return defer(() => from(APIService.fetchUserProfiles({ userUrn }))).pipe(
        map(data => {
          const entities: EntitiesOf<SoundCloud.UserProfiles> = {
            userProfileEntities: {
              [userUrn]: data
            }
          };

          return getUserProfiles.success({
            userUrn,
            entities
          });
        }),
        catchError(
          handleEpicError(
            action$,
            getUserProfiles.failure({
              userUrn
            })
          )
        )
      );
    })
  );
