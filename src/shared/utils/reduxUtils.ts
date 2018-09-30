import { REDUX_STATES } from '../../types';

export function isLoading(actionType: string): string {
    return `${actionType}_${REDUX_STATES.LOADING}`;
}

export function onSuccess(actionType: string): string {
    return `${actionType}_${REDUX_STATES.SUCCESS}`;

}

export function onError(actionType: string): string {
    return `${actionType}_${REDUX_STATES.ERROR}`;
}
