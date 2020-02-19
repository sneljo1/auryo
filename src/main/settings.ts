// import { ConfigState } from '@common/store/config';
import Store from 'electron-store';
import { MockSettings } from './mockSettings';

export const settings: any = !process.env.TOKEN
  ? new Store({ name: 'auryo-settings' })
  : // TODO fix Conf types
    // https://github.com/sindresorhus/conf/issues/86
    (new MockSettings() as any);
