import { REDUX_STATES } from "../constants";

export function isLoading(actionType) {
    return `${actionType}_${REDUX_STATES.LOADING}`
}
export function onSuccess(actionType) {
    return `${actionType}_${REDUX_STATES.SUCCESS}`

}
export function onError(actionType) {
    return `${actionType}_${REDUX_STATES.ERROR}`

}