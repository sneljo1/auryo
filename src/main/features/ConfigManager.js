import { session, app } from 'electron';
import debounce from 'lodash/debounce';
import defaultsDeep from 'lodash/defaultsDeep';
import { show } from 'redux-modal';
import semver from 'semver';
import { CONFIG } from '../../config';
import { canGoInHistory } from '../../shared/actions/app/app.actions';
import { setConfig } from '../../shared/actions/config.actions';
import { EVENTS } from '../../shared/constants/events';
import settings from '../settings';
import { Logger } from '../utils/logger';
import { getProxyUrlFromConfig } from '../utils/utils';
import IFeature from './IFeature';

export default class ConfigManager extends IFeature {

    isNewVersion = false

    isNewUser = false

    constructor(auryo) {
        super(auryo)

        this.writetoConfig = debounce(config => settings.setAll(config), 250)
    }

    register() {
        try {
            this.config = settings.getAll()
        } catch (e) {
            this.config = CONFIG.DEFAULT_CONFIG
        }

        if (typeof this.config.version === 'undefined') {
            this.config.version = app.getVersion()
            this.isNewUser = true
        } else if (semver.lt(this.config.version, app.getVersion())) {
            this.config.version = app.getVersion()
            this.isNewVersion = true
        }

        // fill out default values if config is incomplete
        this.config = defaultsDeep(this.config, CONFIG.DEFAULT_CONFIG)

        if (this.config.enableProxy) {
            Logger.info('Enabling proxy')

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

        this.writetoConfig(this.config)
        this.store.dispatch(setConfig(this.config))

        this.on(EVENTS.APP.READY, () => {
            this.notifyNewVersion();
            this.notifyNewUser();
            this.on(EVENTS.APP.NAVIGATE,this.checkCanGo)
            this.subscribe('config', this.updateConfig)
        })

        
    }

    /**
     * Write new values to the config file
     */
    updateConfig = ({ currentValue }) => {
        this.writetoConfig(currentValue)
    }

    /**
     * On route change, check if can Go from browser webcontents
     */
    checkCanGo = () => {
        if (this.win && this.win.webContents) {

            const canGoBack = this.win.webContents.canGoBack()
            const canGoForward = this.win.webContents.canGoForward()

            this.store.dispatch(canGoInHistory(canGoBack, canGoForward))
        }
    }

    /**
     * If version doesn't match config version, send update to frontend on app loaded
     */
    notifyNewVersion = () => {
        if (this.isNewVersion && !this.isNewUser && !process.env.TOKEN) {
            setTimeout(() => {
                this.store.dispatch(show('changelog', { version: app.getVersion() }))
                super.unregister(['app', 'loaded'])
            }, 5000)
        }
    }

    notifyNewUser = () => {
        if (this.isNewUser && !process.env.TOKEN) {
            setTimeout(() => {
                this.store.dispatch(show('welcome'))
            }, 5000)
        }
    }

}