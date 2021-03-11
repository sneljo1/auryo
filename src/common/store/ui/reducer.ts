import { createReducer } from 'typesafe-actions';
import { resetStore, setSearchQuery } from '../actions';
import { UIState } from '../types';

const initialState: UIState = {
  searchQuery: undefined
};

export const uiReducer = createReducer<UIState>(initialState)
  .handleAction(setSearchQuery, (state, action) => {
    return {
      ...state,
      searchQuery: action.payload.query
    };
  })
  .handleAction(resetStore, () => {
    return initialState;
  });
