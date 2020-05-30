import { AxiosError } from 'axios';
import { ThunkAction } from 'redux-thunk';
import * as Normalized from './normalized';
import * as SoundCloud from './soundcloud';
import { StoreState } from 'AppReduxTypes';

export { SoundCloud, Normalized };

export interface GetPlaylistOptions {
  refresh?: boolean;
  appendId?: number | null;
}

export interface ObjectMap {
  [followId: string]: boolean;
}

export type Collection<T> = {
  collection: T[];
  next_href?: string;
  query_urn?: string | null;
};

export type EntitiesOf<T> = { [key: string]: { [key: string]: T } };

export type ResultOf<T, K extends keyof T> = Array<Omit<T, K> & { [P in K]: string }>;

export type ThunkResult<R> = ThunkAction<R, StoreState, undefined, any>;

export interface EpicFailure {
  error: AxiosError | Error;
}
