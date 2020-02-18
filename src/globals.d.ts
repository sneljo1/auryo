/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface Global {
    __static: any;
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
