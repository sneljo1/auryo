import * as is from 'electron-is'
import Feature from '../feature'

export default class WindowsFeature extends Feature {
  // eslint-disable-next-line
  shouldRun() {
    return is.windows()
  }
}
