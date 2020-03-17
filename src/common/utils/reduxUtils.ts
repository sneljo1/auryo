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

export function wSuccess(actionType: string): typeof actionType {
  return `${actionType}_SUCCESS`;
}

export function wError(actionType: string): typeof actionType {
  return `${actionType}_ERROR`;
}
export function wDebounce(actionType: string) {
  return `${actionType}_DEBOUNCE`;
}
