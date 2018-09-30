export interface IFeature {
  subscribe(path: Array<string>, handler: Function): void;

  sendToWebContents(channel: string, params: object): void;

  register(): void;

  on(path: string, handler: Function): void;

  unregister(path?: Array<string> | string): void;

  shouldRun(): boolean;
}
