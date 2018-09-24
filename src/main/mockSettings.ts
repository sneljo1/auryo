import { Settings, JsonValue, SettingsOptions } from './settings.interface';
import _ from 'lodash';

export class MockSettings implements Partial<Settings> {
  private data: any = {};
  private filePath: string;

  has(keyPath: string) {
    return !!_.get(this.data, keyPath);
  }

  set(keyPath: string, value: JsonValue, options?: SettingsOptions) {
    this.data[keyPath] = value;

    return this as any;
  }

  setAll(obj: JsonValue, options?: SettingsOptions): Settings {
    this.data = obj;

    return this as any;
  }

  get(keyPath: string, defaultValue?: any, options?: SettingsOptions): JsonValue {
    return _.get(this.data, keyPath) || defaultValue;
  }

  getAll(): JsonValue {
    return this.data;
  }

  delete(keyPath: string, options?: SettingsOptions): Settings {
    delete this.data[keyPath];

    return this as any;
  }

  deleteAll(options?: SettingsOptions): Settings {
    this.data = {};

    return this as any;
  }

  file(): string {
    return this.filePath;
  }

  setPath(filePath: string): Settings {
    this.filePath = filePath;

    return this as any;
  }

  clearPath(): Settings {
    this.filePath = '';
    return this as any;
  }
}
