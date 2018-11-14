import * as _ from 'lodash';

export class MockSettings {

  public store = {};

  set(key: string, value: any) {
    this.store[key] = value;
  }
  get(key: string, defaultValue: any) {
    return this.store[key] || defaultValue;
  }
  has(key: string) {
    return !!this.store[key];
  }

  delete(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}
