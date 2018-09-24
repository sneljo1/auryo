import * as is from 'electron-is'
import Feature from '../feature'

export default class MacFeature extends Feature {
  // eslint-disable-next-line
  shouldRun() {
    return is.macOS()
  }
}
