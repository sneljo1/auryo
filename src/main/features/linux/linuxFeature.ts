import * as is from 'electron-is'
import Feature from '../feature'

export default class LinuxFeature extends Feature {
  // eslint-disable-next-line
  shouldRun() {
    return is.linux()
  }
  
}
