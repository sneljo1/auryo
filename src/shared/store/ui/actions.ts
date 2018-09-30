import { action } from 'typesafe-actions';
import { ThunkResult } from '../../../types';
import { UIActionTypes } from './types';
import { IToastOptions } from '@blueprintjs/core';

export function toggleQueue(newState: boolean): ThunkResult<void> {
    return (dispatch, getState) => {
        const { ui: { showQueue } } = getState();

        dispatch({
            type: UIActionTypes.TOGGLE_QUEUE,
            payload: (newState != null ? newState : !showQueue)
        });
    };
}

export const setScrollPosition = (scrollTop: number, pathname: string) => action(UIActionTypes.SET_SCROLL_TOP, {
    scrollTop,
    pathname
});

export const addToast = (toast: IToastOptions) => action(UIActionTypes.ADD_TOAST, { toast });
export const removeToast = (key: string) => action(UIActionTypes.REMOVE_TOAST, { key });
export const clearToasts = () => action(UIActionTypes.CLEAR_TOASTS);
