declare module 'react-masonry-css' {
  import * as React from 'react';

  export type BreakPoint = {
    default: number;
    [breakpoint: number]: number;
  }

  export interface Props {
    breakpointCols?: BreakPoint,
    className?: string,
    columnClassName?: string,
  }

  export default class ReactMasonryCss extends React.Component<Props> { }
}