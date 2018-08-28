import unhandled from 'electron-unhandled'
import IFeature from './IFeature'
import {Logger} from '../utils/logger'
import { registerError } from '../utils/raven'

export default class ExceptionManager extends IFeature {

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
                logger: Logger.error
            })
        } else {
            unhandled({
                logger: Logger.error,
                showDialog: false
            })
        }
    }

}