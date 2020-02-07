import * as is from 'electron-is';
import { Feature } from '../feature';

export default class LinuxFeature extends Feature {
  public static featureName: string;
  // eslint-disable-next-line
  public shouldRun() {
    return is.linux();
  }
}
