import * as is from 'electron-is';
import { Feature } from '../feature';

export class WindowsFeature extends Feature {
  // eslint-disable-next-line
  public shouldRun() {
    return is.windows();
  }
}
