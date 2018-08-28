import { ipcRenderer } from "electron";
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { EVENTS } from '../../../../shared/constants/events';
import CheckboxConfig from './components/CheckboxConfig';
import InputConfig from './components/InputConfig';
import './settings.scss';

class SettingsTab extends Component {

    state = {
        restartMsg: false,
        validDir: true
    }

    restart = () => {
        ipcRenderer.send(EVENTS.APP.RESTART)
    }

    isValidDirectory = (dir, setKey) => {

        ipcRenderer.send(EVENTS.APP.VALID_DIR, dir)
        ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (event, exists) => {
            this.setState({
                validDir: exists
            })

            setKey()
        })
    }

    render() {
        const {
            config,
            setConfigKey,
            authenticated
        } = this.props

        const { restartMsg, validDir } = this.state;

        if (!authenticated) {
            return (
                <div>

                    {
                        restartMsg && (
                            <div className="info-message">A <a href="javascript:void(0)"
                                onClick={this.restart}>restart</a> is required to
                                enable/disable this feature.</div>
                        )
                    }

                    <div className="setting-group">
                        <div className="setting-group-title">Proxy (Experimental)</div>

                        <div>
                            <CheckboxConfig onChange={(value, setKey) => {
                                this.setState({
                                    restartMsg: true
                                })
                                setKey()
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
                    restartMsg && (
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

                        <InputConfig name="Download path"
                            configKey="app.downloadPath" invalid={!validDir} onChange={(value, setKey) => this.isValidDirectory(value, setKey)} {...this.props} />

                    </div>
                </div>
                <div className="setting-group">
                    <div className="setting-group-title">Stream</div>

                    <div>
                        <CheckboxConfig onChange={(value, setKey) => {
                            this.setState({
                                restartMsg: true
                            })
                            setKey()
                        }} name="Hide reposts" configKey="hideReposts" config={config}
                            setConfigKey={setConfigKey} />
                    </div>
                </div>
                <div className="setting-group">
                    <div className="setting-group-title">Proxy (Experimental)</div>

                    <div>
                        <CheckboxConfig onChange={(value, setKey) => {
                            this.setState({
                                restartMsg: true
                            })
                            setKey()
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
                                                      configKey="proxy.scheme" {...this.props} /> */
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
    config: PropTypes.object.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    authenticated: PropTypes.bool
}

SettingsTab.defaultProps = {
    authenticated: false
}

export default SettingsTab