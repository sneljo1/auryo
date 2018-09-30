import { IToastOptions } from '@blueprintjs/core';

// TYPES

export interface UIState extends Readonly<{
    showQueue: boolean;
    scrollTop: number;
    scrollPosition: {
        [path: string]: number;
    },
    toasts: Array<IToastOptions>;
}> { }

// ACTIONS

export const enum UIActionTypes {
    TOGGLE_QUEUE = '@@ui/TOGGLE_QUEUE',
    SET_SCROLL_TOP = '@@ui/SET_SCROLL_TOP',

    ADD_TOAST = '@@ui/ADD_TOAST',
    REMOVE_TOAST = '@@ui/REMOVE_TOAST',
    CLEAR_TOASTS = '@@ui/CLEAR_TOASTS',
}
