import { normalizeArray } from '@common/schemas';
import { handleEpicError } from '@common/utils/errors/EpicError';
import { EntitiesOf, SoundCloud } from '@types';
import { defer, from, of } from 'rxjs';
import { catchError, filter, map, pluck, switchMap, tap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { RootEpic } from '../../common/store/declarations';
import { getUser, getUserProfiles } from '../../common/store/user/actions';
import * as APIService from '../../common/store/user/api';

export const getUserEpic: RootEpic = (action$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(getUser.request)),
    tap((action) => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userId, refresh }) => {
      return defer(() => from(APIService.fetchUser({ userId }))).pipe(
        map((user) => normalizeArray<SoundCloud.User>([user])),
        map((data) =>
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

export const getUserProfilesEpic: RootEpic = (action$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(getUserProfiles.request)),
    tap((action) => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ userId }) => {
      return defer(() => from(APIService.fetchUserProfiles({ userId }))).pipe(
        map((data) => {
          const entities: EntitiesOf<SoundCloud.UserProfiles> = {
            userProfileEntities: {
              [userId]: data
            }
          };

          return getUserProfiles.success({
            userId,
            entities
          });
        }),
        catchError(
          handleEpicError(
            action$,
            getUserProfiles.failure({
              userId
            })
          )
        )
      );
    })
  );
