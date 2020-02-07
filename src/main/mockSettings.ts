export class MockSettings {
  public store: any = {};

  public set(key: string, value: any) {
    this.store[key] = value;
  }
  public get(key: string, defaultValue: any) {
    return this.store[key] || defaultValue;
  }
  public has(key: string) {
    return !!this.store[key];
  }

  public delete(key: string) {
    // tslint:disable-next-line: no-dynamic-delete
    delete this.store[key];
  }

  public clear() {
    this.store = {};
  }
}
