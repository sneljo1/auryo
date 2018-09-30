import ElectronSettings from 'electron-settings';
import { MockSettings } from './mockSettings';
import { Settings } from './settings.interface';

// eslint-disable-next-line
let s: Settings;

if (!process.env.TOKEN) {
  s = ElectronSettings;
} else {
  s = new MockSettings() as any;
}

export const settings = s;
