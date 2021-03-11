export function wSuccess(actionType: string): typeof actionType {
  return `${actionType}_SUCCESS`;
}

export function wError(actionType: string): typeof actionType {
  return `${actionType}_ERROR`;
}
export function wCancel(actionType: string): typeof actionType {
  return `${actionType}_CANCEL`;
}
export function wDebounce(actionType: string) {
  return `${actionType}_DEBOUNCE`;
}
