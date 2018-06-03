import React, { Component } from 'react'
import './settings.scss'
import CheckboxConfig from './components/CheckboxConfig'
import PropTypes from 'prop-types'
import InputConfig from './components/InputConfig'
import { windowRouter } from '../../../../shared/utils/router'
import { EVENTS } from '../../../../shared/constants/events'

class SettingsTab extends Component {

    state = {
        restartMsg: false
    }

    restart = () => {
        windowRouter.send(EVENTS.APP.RESTART)
    }

    render() {
        const {
            config,
            setConfigKey,
            authenticated
        } = this.props

        if (!authenticated) {
            return (
                <div>

                    {
                        this.state.restartMsg && (
                            <div className="info-message">A <a href="javascript:void(0)"
                                                               onClick={this.restart}>restart</a> is required to
                                enable/disable this feature.</div>
                        )
                    }

                    <div className="setting-group">
                        <div className="setting-group-title">Proxy</div>

                        <div>
                            <CheckboxConfig onChange={() => {
                                this.setState({
                                    restartMsg: true
                                })
                            }} name="Enable proxy" configKey="enableProxy" {...this.props} />

                            {
                                config.enableProxy ? (
                                    <div className="container-fluid p-0 mt-2">
                                        <div className="form-group form-row">
                                            <InputConfig usePlaceholder className="col-8" name="Host"
                                                         configKey="proxy.host" {...this.props} />
                                            <InputConfig usePlaceholder className="col-4" name="Port"
                                                         configKey="proxy.port" {...this.props} />
                                        </div>
                                        <div className="form-group form-row">
                                            <InputConfig usePlaceholder className="col-6" name="Username"
                                                         configKey="proxy.username" {...this.props} />
                                            <InputConfig usePlaceholder className="col-6" name="Password"
                                                         configKey="proxy.password" {...this.props} />
                                        </div>
                                    </div>
                                ) : null
                            }
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div>

                {
                    this.state.restartMsg && (
                        <div className="info-message">A <a href="javascript:void(0)"
                                                           onClick={this.restart}>restart</a> is required to
                            enable/disable this feature.</div>
                    )
                }

                <div className="setting-group">
                    <div className="setting-group-title">General</div>

                    <div>
                        <CheckboxConfig name="Send anonymous statistics" configKey="app.analytics"
                                        config={config}
                                        setConfigKey={setConfigKey} />
                        <CheckboxConfig name="Send crash reports" configKey="app.crashReports"
                                        config={config}
                                        setConfigKey={setConfigKey} />
                    </div>
                </div>
                <div className="setting-group">
                    <div className="setting-group-title">Stream</div>

                    <div>
                        <CheckboxConfig onChange={() => {
                            this.setState({
                                restartMsg: true
                            })
                        }} name="Hide reposts" configKey="hideReposts" config={config}
                                        setConfigKey={setConfigKey} />
                    </div>
                </div>
                <div className="setting-group">
                    <div className="setting-group-title">Proxy</div>

                    <div>
                        <CheckboxConfig onChange={() => {
                            this.setState({
                                restartMsg: true
                            })
                        }} name="Enable proxy" configKey="enableProxy" {...this.props} />

                        {
                            config.enableProxy ? (
                                <div className="container-fluid p-0 mt-2">
                                    <div className="form-group form-row">
                                        {
                                            /*
                                        <SelectConfig usePlaceholder data={[
                                            {
                                                key: 'http',
                                                value: 'http'
                                            },
                                            {
                                                key: 'https',
                                                value: 'https'
                                            },
                                            {
                                                key: 'ftp',
                                                value: 'ftp'
                                            },
                                            {
                                                key: 'socks',
                                                value: 'socks'
                                            }
                                        ]} className="col-2" name="Scheme"
                                                      configKey="proxy.scheme" {...this.props} />*/
                                        }
                                        <InputConfig usePlaceholder className="col-8" name="Host"
                                                     configKey="proxy.host" {...this.props} />
                                        <InputConfig usePlaceholder className="col-4" name="Port"
                                                     configKey="proxy.port" {...this.props} />
                                    </div>
                                    <div className="form-group form-row">
                                        <InputConfig usePlaceholder className="col-6" name="Username"
                                                     configKey="proxy.username" {...this.props} />
                                        <InputConfig usePlaceholder className="col-6" name="Password"
                                                     configKey="proxy.password" {...this.props} />
                                    </div>
                                </div>
                            ) : null
                        }
                    </div>

                </div>
            </div>
        )
    }
}

SettingsTab.propTypes = {
    config: PropTypes.object,
    setConfigKey: PropTypes.func,
    authenticated: PropTypes.bool
}

export default SettingsTab