import unhandled from 'electron-unhandled'
import IFeature from './IFeature'
import {Logger} from '../utils/logger'
import { registerError } from '../utils/raven'

export default class ExceptionManager extends IFeature {

    shouldRun(){
        // ref: https://github.com/electron/electron/issues/13767
        return super.shouldRun() && !(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)
    }

    register() {

        this.win.webContents.on('crashed', (event) => {
            Logger.error('APP CRASHED:')
            registerError(event)
        })

        this.win.on('unresponsive', (event) => {
            Logger.error('APP UNRESPONSIVE:')
            registerError(event)
        })

        if (process.env.NODE_ENV === 'production') {
            unhandled({
                logger: (e) => {
                    Logger.error(e)
                }
            })
        } else {
            unhandled({
                logger: (e) => {
                    Logger.error(e)
                },
                showDialog: false
            })
        }
    }

}