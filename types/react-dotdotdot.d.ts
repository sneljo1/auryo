declare module 'react-dotdotdot' {
    import * as React from 'react';
  
    export interface DotdotdotProps {
      children?: React.ReactNode,
      clamp: string | number | boolean,
      truncationChar?: string,
      useNativeClamp?: boolean,
      className?: string,
      tagName?: string,
    }
  
    export default class Dotdotdot extends React.Component<DotdotdotProps> { }
  }