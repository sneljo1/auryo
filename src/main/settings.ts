import * as ElectronSettings from 'electron-settings';
import { MockSettings } from './mockSettings';
import { Settings } from './settings.interface';

export const settings: Settings = !process.env.TOKEN ? ElectronSettings : new MockSettings() as any;
