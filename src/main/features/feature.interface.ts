export interface IFeature {
  subscribe(path: string[], handler: Function): void;

  sendToWebContents(channel: string, params: object): void;

  register(): void;

  on(path: string, handler: Function): void;

  unregister(path?: string[] | string): void;

  shouldRun(): boolean;
}
