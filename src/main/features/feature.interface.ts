export interface IFeature {
  // tslint:disable-next-line:ban-types
  subscribe(path: Array<string>, handler: Function): void;

  sendToWebContents(channel: string, params: object): void;

  register(): void;

  // tslint:disable-next-line:ban-types
  on(path: string, handler: Function): void;

  unregister(path?: Array<string> | string): void;

  shouldRun(): boolean;
}
