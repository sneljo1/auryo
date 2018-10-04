import { ipcRenderer, IpcMessageEvent } from 'electron';
import React from 'react';
import { ConfigState, setConfigKey } from '../../../../../../../shared/store/config';
import CheckboxConfig from './components/CheckboxConfig';
import InputConfig from './components/InputConfig';
import { EVENTS } from '../../../../../../../shared/constants/events';
import fetchRemainingTracks from 'src/shared/api/fetchRemainingTracks';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    authenticated?: boolean;
}

interface State {
    restartMsg: boolean;
    validDir: boolean;
}

class SettingsTab extends React.Component<Props, State> {

    static defaultProps: Partial<Props> = {
        authenticated: false
    };

    state = {
        restartMsg: false,
        validDir: true
    };

    restart = () => {
        ipcRenderer.send(EVENTS.APP.RESTART);
    }

    isValidDirectory = (dir: string, setKey: Function) => {
        ipcRenderer.send(EVENTS.APP.VALID_DIR, dir);
        ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event: IpcMessageEvent, exists: boolean) => {
            this.setState({
                validDir: exists
            });

            setKey();
        });
    }

    render() {
        const {
            config,
            setConfigKey,
            authenticated
        } = this.props;

        const { restartMsg, validDir } = this.state;

        return (
            <div>

                {
                    restartMsg && (
                        <div className='info-message'>A <a href='javascript:void(0)'
                            onClick={this.restart}>restart</a> is required to
                            enable/disable this feature.</div>
                    )
                }

                {
                    authenticated && (
                        <div className='setting-group'>
                            <div className='setting-group-title'>General</div>

                            <div>
                                <CheckboxConfig
                                    name='Send anonymous statistics'
                                    configKey='app.analytics'
                                    config={config}
                                    setConfigKey={setConfigKey} />
                                <CheckboxConfig
                                    name='Send crash reports'
                                    configKey='app.crashReports'
                                    config={config}
                                    setConfigKey={setConfigKey} />

                                <InputConfig
                                    name='Download path'
                                    configKey='app.downloadPath'
                                    invalid={!validDir}
                                    {...this.props}
                                    onChange={(value, setKey) => this.isValidDirectory(value, setKey)} />

                            </div>
                        </div>
                    )
                }

                {
                    authenticated && (
                        <div className='setting-group'>
                            <div className='setting-group-title'>Stream</div>

                            <div>
                                <CheckboxConfig
                                    name='Hide reposts'
                                    configKey='hideReposts'
                                    config={config}
                                    setConfigKey={setConfigKey}

                                    onChange={(_value, setKey) => {
                                        this.setState({
                                            restartMsg: true
                                        });
                                        setKey();
                                    }}
                                />
                            </div>
                        </div>
                    )
                }

                <div className='setting-group'>
                    <div className='setting-group-title'>Proxy (Experimental)</div>

                    <div>
                        <CheckboxConfig
                            name='Enable proxy'
                            configKey='enableProxy'
                            {...this.props}
                            onChange={(_value, setKey) => {
                                this.setState({
                                    restartMsg: true
                                });
                                setKey();
                            }} />

                        {
                            config.enableProxy ? (
                                <div className='container-fluid p-0 mt-2'>
                                    <div className='form-group form-row'>
                                        <InputConfig usePlaceholder={true} className='col-8' name='Host'
                                            configKey='proxy.host' {...this.props} />
                                        <InputConfig usePlaceholder={true} className='col-4' name='Port'
                                            configKey='proxy.port' {...this.props} />
                                    </div>
                                    <div className='form-group form-row'>
                                        <InputConfig usePlaceholder={true} className='col-6' name='Username'
                                            configKey='proxy.username' {...this.props} />
                                        <InputConfig usePlaceholder={true} className='col-6' name='Password'
                                            configKey='proxy.password' {...this.props} />
                                    </div>
                                </div>
                            ) : null
                        }
                    </div>

                </div>
            </div>
        );
    }
}

export default SettingsTab;
