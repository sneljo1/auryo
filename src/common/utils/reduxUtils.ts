import { ActionType } from 'redux-promise-middleware';

export function isLoading(actionType: string): string {
  return `${actionType}_${ActionType.Pending}`;
}

export function onSuccess(actionType: string): string {
  return `${actionType}_${ActionType.Fulfilled}`;
}

export function onError(actionType: string): string {
  return `${actionType}_${ActionType.Rejected}`;
}
