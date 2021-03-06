// TYPES
export type UIState = Readonly<{
  searchQuery?: string;
}>;

export interface Dimensions {
  width: number;
  height: number;
}

// ACTIONS
export enum UIActionTypes {
  SET_SEARCH_QUERY = '@@auryo.ui.SET_SEARCH_QUERY'
}
