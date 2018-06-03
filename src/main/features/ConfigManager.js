import settings from '../settings'
import IFeature from './IFeature'
import { DEFAULT_CONFIG } from '../../config'
import { setConfig } from '../../shared/actions/config.actions'
import { version } from '../../package.json'
import semver from 'semver'
import debounce from 'lodash/debounce'
import defaultsDeep from 'lodash/defaultsDeep'
import { EVENTS } from '../../shared/constants/events'
import { canGoInHistory } from '../../shared/actions/app/app.actions'
import { session } from 'electron'
import { getProxyUrlFromConfig } from '../utils/utils'
import { Logger } from '../utils/logger'

export default class ConfigManager extends IFeature {

    is_new_version = false

    constructor(app) {
        super(app)

        this._checkCanGo = this._checkCanGo.bind(this)

        this.writetoConfig = debounce(config => settings.setAll(config), 5000)

    }

    register() {
        try {
            this.config = settings.getAll()
        } catch (e) {
            this.config = DEFAULT_CONFIG
        }

        if (typeof this.config.version === 'undefined') {
            this.config.version = version
        } else if (semver.lt(this.config.version, version)) {
            this.config.version = version
            this.is_new_version = true
        }

        // fill out default values if config is incomplete
        this.config = defaultsDeep(this.config, DEFAULT_CONFIG)

        if (this.config.enableProxy) {
            Logger.info('Enabling proxy')
            console.log(getProxyUrlFromConfig(this.config.proxy))
            session.defaultSession.setProxy({
                proxyRules: getProxyUrlFromConfig(this.config.proxy)
            }, () => {
                session.defaultSession.resolveProxy('https://api.soundcloud.com', (proxy) => {
                    Logger.info('Proxy status: ', proxy)

                    if (!proxy) {
                        session.defaultSession.setProxy({
                            proxyRules: ''
                        }, () => {
                        })
                    }
                })
            })
        }

        this.store.dispatch(setConfig(this.config))

        this.subscribe(['app', 'loaded'], this._notifyNewVersion)

        this.on(EVENTS.APP.READY, () => {
            this.on('GO', this._checkCanGo)
            this.subscribe('config', this._updateConfig)
        })
    }

    /**
     * Write new values to the config file
     */
    _updateConfig = ({ currentValue }) => {

        this.writetoConfig(currentValue)
    }

    /**
     * On route change, check if can Go from browser webcontents
     */


    _checkCanGo() {

        if (this.win && this.win.webContents) {

            const canGoBack = this.win.webContents.canGoBack()
            const canGoForward = this.win.webContents.canGoForward()

            this.store.dispatch(canGoInHistory(canGoBack, canGoForward))

        }

    }

    /**
     * If version doesn't match config version, send update to frontend on app loaded
     */
    _notifyNewVersion = () => {
        const _this = this

        if (this.is_new_version) {
            setTimeout(() => {
                _this.router.send(EVENTS.APP.NEW_VERSION, version)
                super.unregister(['app', 'loaded'])
            }, 1000)
        }
    }

    unregister() {
        super.unregister()
    }

}