import { session } from 'electron';
import debounce from 'lodash/debounce';
import defaultsDeep from 'lodash/defaultsDeep';
import semver from 'semver';
import { CONFIG } from '../../config';
import { version } from '../../package.json';
import { canGoInHistory } from '../../shared/actions/app/app.actions';
import { setConfig } from '../../shared/actions/config.actions';
import { EVENTS } from '../../shared/constants/events';
import settings from '../settings';
import { Logger } from '../utils/logger';
import { getProxyUrlFromConfig } from '../utils/utils';
import IFeature from './IFeature';

export default class ConfigManager extends IFeature {

    is_new_version = false

    constructor(app) {
        super(app)

        this.writetoConfig = debounce(config => settings.setAll(config), 5000)

    }

    register() {
        try {
            this.config = settings.getAll()
        } catch (e) {
            this.config = CONFIG.DEFAULT_CONFIG
        }

        if (typeof this.config.version === 'undefined') {
            this.config.version = version
        } else if (semver.lt(this.config.version, version)) {
            this.config.version = version
            this.is_new_version = true
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

        this.store.dispatch(setConfig(this.config))


        this.on(EVENTS.APP.READY, () => {
            this.notifyNewVersion();
            this.on('GO', this.checkCanGo)
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
        if (this.is_new_version) {
            setTimeout(() => {
                this.router.send(EVENTS.APP.NEW_VERSION, version)
                super.unregister(['app', 'loaded'])
            }, 5000)
        }
    }

}