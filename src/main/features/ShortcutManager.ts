import { globalShortcut } from 'electron'
import { CHANGE_TYPES, PLAYER_STATUS } from '../../shared/constants'
import IFeature from './feature'
import { EVENTS } from '../../shared/constants/events'

/**
 * Register global media shortcuts
 */
export default class Shortcut extends IFeature {
  register() {
    globalShortcut.register('MediaPlayPause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS)
    })
    globalShortcut.register('MediaPreviousTrack', () => {
      this.changeTrack(CHANGE_TYPES.PREV)
    })
    globalShortcut.register('MediaNextTrack', () => {
      this.changeTrack(CHANGE_TYPES.NEXT)
    })
    globalShortcut.register('MediaStop', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.STOPPED)
    })
  }

  // eslint-disable-next-line
  unregister() {
    globalShortcut.unregisterAll()
  }

  changeTrack = (changeType: any) => {
    // TODO change to enum
    this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, changeType)
  }
}
