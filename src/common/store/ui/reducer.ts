import { Reducer } from 'redux';
// eslint-disable-next-line import/no-cycle
import { AppActionTypes } from '../app';
import { UIActionTypes, UIState } from './types';

const initialState = {
  scrollTop: 0,
  scrollPosition: {},
  toasts: []
};

export const uiReducer: Reducer<UIState> = (state = initialState, action) => {
  const { payload, type } = action;

  switch (type) {
    case UIActionTypes.SET_SCROLL_TOP:
      return {
        ...state,
        scrollPosition: {
          ...state.scrollPosition,
          [payload.pathname]: payload.scrollTop
        }
      };
    case UIActionTypes.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };
    case UIActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, payload.toast]
      };
    case UIActionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: [...state.toasts.filter(t => t.key === payload.key)]
      };
    case AppActionTypes.RESET_STORE:
      return initialState;
    default:
      return state;
  }
};
