/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface Global {
    __static: any;
    fetch: any;
    AbortController: any;
  }
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

// eslint-disable-next-line no-underscore-dangle
declare const __static: string;

declare module 'electron-window-state';
declare module 'react-dotdotdot';
declare module 'color-hash';
declare module 'react-marquee';

declare module 'AppReduxTypes' {
  import { StateType, ActionType } from 'typesafe-actions';
  import { AuthState } from '@common/store/auth';
  import {
    AppAuthState,
    EntitiesState,
    PlayerState,
    ObjectsState,
    ConfigState,
    TrackState,
    UserState
  } from '@common/store/types';
  import { AppState } from '@common/store/app';
  import { UIState } from '@common/store/ui';
  import { ModalState } from 'redux-modal';
  import { RouterState } from 'connected-react-router';

  interface _StoreState {
    auth: AuthState;
    appAuth: AppAuthState;
    entities: EntitiesState;
    player: PlayerState;
    objects: ObjectsState;
    app: AppState;
    config: ConfigState;
    ui: UIState;
    modal: ModalState;
    router: RouterState;
    track: TrackState;
    user: UserState;
  }

  export type Store = StateType<typeof import('@common/store/index').default>;
  export type RootAction = ActionType<typeof import('@common/store/actions')>;
  export type RootState = StateType<_StoreState>;
  export type StoreState = _StoreState;
}
