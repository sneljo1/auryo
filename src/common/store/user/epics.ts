import { normalizeArray } from '@common/schemas';
import { EntitiesOf, SoundCloud } from '@types';
import { AxiosError } from 'axios';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap, pluck } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { RootEpic } from '../declarations';
import { getUser, getUserProfiles } from './actions';
import * as APIService from './api';

const handleEpicError = (error: any) => {
  if ((error as AxiosError).isAxiosError) {
    console.log(error.message, error.response.data);
  } else {
    console.error('Epic error - user', error);
  }
  // TODO Sentry?
  return error;
};

export const getUserEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getUser.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userId, refresh }) => {
      return from(APIService.fetchUser({ userId })).pipe(
        map(user => normalizeArray<SoundCloud.User>([user])),
        map(data =>
          getUser.success({
            userId,
            entities: data.normalized.entities
          })
        ),
        catchError(error =>
          of(
            getUser.failure({
              error: handleEpicError(error),
              userId
            })
          )
        )
      );
    })
  );

export const getUserProfilesEpic: RootEpic = action$ =>
  action$.pipe(
    filter(isActionOf(getUserProfiles.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userUrn }) => {
      return from(APIService.fetchUserProfiles({ userUrn })).pipe(
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
        catchError(error =>
          of(
            getUserProfiles.failure({
              error: handleEpicError(error),
              userUrn
            })
          )
        )
      );
    })
  );
