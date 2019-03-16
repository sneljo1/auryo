import { Button, Collapse, Switch } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import { logout } from '@common/store/auth';
import { setConfig, setConfigKey } from '@common/store/config';
import Header from '@renderer/app/components/Header/Header';
import CustomScroll from '@renderer/_shared/CustomScroll';
import PageHeader from '@renderer/_shared/PageHeader/PageHeader';
import { CONFIG } from '../../../config';
import { IpcMessageEvent, ipcRenderer } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import CheckboxConfig from './components/CheckboxConfig';
import InputConfig from './components/InputConfig';
import './Settings.scss';
import SelectConfig from './components/SelectConfig';

interface Props {
    noHeader?: boolean;
}

interface State {
    lastfmLoading: boolean;
    restartMsg: boolean;
    validDir: boolean;
    advancedOpen: boolean;
    audioDevices: Array<MediaDeviceInfo>;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = Props & PropsFromState & PropsFromDispatch;

class Settings extends React.PureComponent<AllProps, State> {

    static defaultProps: Partial<AllProps> = {
        authenticated: false
    };

    public readonly state: State = {
        lastfmLoading: false,
        restartMsg: false,
        validDir: true,
        advancedOpen: false,
        audioDevices: []
    };

    async componentDidMount() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter((device) => device.kind === 'audiooutput');

            this.setState({
                audioDevices
            });

        } catch (err) {
            throw err;
        }
    }

    restart = () => {
        ipcRenderer.send(EVENTS.APP.RESTART);
    }

    isValidDirectory = () => {
        ipcRenderer.send(EVENTS.APP.VALID_DIR);
        ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event: IpcMessageEvent, dir: string) => {
            this.props.setConfigKey('app.downloadPath', dir);
        });
    }

    render() {
        return (
            <CustomScroll
                heightRelativeToParent='100%'
            >
                {
                    !this.props.noHeader && (
                        <Header scrollTop={0} />
                    )
                }

                <PageHeader
                    title='Settings'
                />


                <div className='settingsWrapper'>
                    {this.renderSettings()}
                </div>
            </CustomScroll>
        );
    }

    private renderSettings() {
        const {
            config,
            authenticated
        } = this.props;

        const { restartMsg } = this.state;

        return (
            <>
                {
                    restartMsg && (
                        <div className='info-message'>
                            A <a href='javascript:void(0)' onClick={this.restart}>restart</a> is required to enable/disable this feature.
                        </div>
                    )
                }

                {
                    authenticated &&
                    this.renderAuthenticatedSettings()
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
                            }}
                        />

                        {
                            config.enableProxy ? (
                                <div className='container-fluid p-0 mt-2'>
                                    <div className='form-group form-row'>
                                        <InputConfig
                                            usePlaceholder={true}
                                            className='col-8'
                                            name='Host'
                                            configKey='proxy.host'
                                            {...this.props}
                                        />
                                        <InputConfig
                                            usePlaceholder={true}
                                            className='col-4'
                                            name='Port'
                                            configKey='proxy.port'
                                            {...this.props}
                                        />
                                    </div>
                                    <div className='form-group form-row'>
                                        <InputConfig
                                            usePlaceholder={true}
                                            className='col-6'
                                            name='Username'
                                            configKey='proxy.username'
                                            {...this.props}
                                        />
                                        <InputConfig
                                            usePlaceholder={true}
                                            className='col-6'
                                            name='Password'
                                            configKey='proxy.password'
                                            {...this.props}
                                        />
                                    </div>
                                </div>
                            ) : null
                        }

                        {
                            authenticated && (
                                <div className='mt-3'>
                                    <Collapse isOpen={this.state.advancedOpen}>
                                        {this.renderAdvancedSettings()}
                                    </Collapse>
                                    <Button onClick={this.handleClick}>
                                        {this.state.advancedOpen ? 'Hide' : 'Show'} advanced settings
                                    </Button>
                                </div>
                            )
                        }
                    </div>

                </div>
            </>
        );
    }

    private handleClick = () => {
        this.setState({ advancedOpen: !this.state.advancedOpen });
    }

    private renderAdvancedSettings() {
        const {
            setConfig,
            logout,
            config,
            setConfigKey
        } = this.props;

        const { audioDevices } = this.state;

        return (
            <div className='setting-group mt-2'>
                <div className='setting-group-title'>Advanced settings</div>

                <SelectConfig
                    name='Audio output'
                    setConfigKey={setConfigKey}
                    config={config}
                    data={[
                        { k: 'Use device settings', v: null },
                        ...audioDevices.map((d) => ({ k: d.label, v: d.deviceId }))
                    ]}
                    configKey='audio.playbackDeviceId'
                />

                <div className='setting'>
                    <a
                        onClick={() => {
                            setConfig(CONFIG.DEFAULT_CONFIG);
                            logout();
                        }}
                        className='text-danger'
                    >
                        Delete all settings
                    </a>
                </div>
            </div>
        );
    }

    private renderAuthenticatedSettings() {
        const {
            config,
            setConfigKey,
        } = this.props;

        return (
            <>
                <div className='setting-group'>
                    <div className='setting-group-title'>General</div>

                    <div>
                        <CheckboxConfig
                            name='Send anonymous statistics'
                            configKey='app.analytics'
                            config={config}
                            setConfigKey={setConfigKey}
                        />
                        <CheckboxConfig
                            name='Send crash reports'
                            configKey='app.crashReports'
                            config={config}
                            setConfigKey={setConfigKey}
                        />

                        <CheckboxConfig
                            name='Show notification on track change'
                            configKey='app.showTrackChangeNotification'
                            config={config}
                            setConfigKey={setConfigKey}
                        />

                        <div className='setting d-flex justify-content-between align-items-center'>
                            <div>
                                Download path
                                <div className='value'>
                                    {'app.downloadPath'.split('.').reduce((o, i) => o[i], config)}
                                </div>
                            </div>
                            <Button onClick={this.isValidDirectory} >Change directory</Button>
                        </div>

                        <InputConfig
                            config={config}
                            setConfigKey={setConfigKey}
                            configKey='app.overrideClientId'
                            type='text'
                            name='Use your own clientId'
                            description={(
                                <div>Read <a href='https://github.com/Superjo149/auryo/wiki/Custom-clientId'>here</a> why and how.</div>
                            )}
                        />

                    </div>
                </div>

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
                <div className='setting-group'>
                    <div className='setting-group-title'>Integrations</div>

                    <div>
                        <div className='setting d-flex justify-content-between align-items-start'>
                            <div>
                                LastFm integration
                                <div className='mt-1'>
                                    {
                                        !!config.lastfm && (
                                            <>
                                                {
                                                    config.lastfm && config.lastfm.key ? (
                                                        <div className='value d-flex align-items-center'>
                                                            <span>Authorized as {config.lastfm.user}</span>
                                                            <a
                                                                onClick={() => setConfigKey('lastfm', null)}
                                                                className='text-danger'
                                                            >
                                                                <i className='bx bx-x' />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                            <Button
                                                                loading={this.state.lastfmLoading}
                                                                onClick={this.authorizeLastFm}
                                                            >
                                                                Authorize
                                                            </Button>
                                                        )
                                                }
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                            <div>
                                <Switch
                                    alignIndicator='right'
                                    large={true}
                                    checked={!!config.lastfm}
                                    onChange={this.toggleLastFm}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }

    private toggleLastFm = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.setConfigKey('lastfm', event.target.checked ? {} : null);
    }

    private authorizeLastFm = () => {
        this.setState({
            lastfmLoading: true
        });
        ipcRenderer.send(EVENTS.APP.LASTFM.AUTH);
    }
}

const mapStateToProps = ({ config, auth }: StoreState) => ({
    config,
    authenticated: !!config.token && !auth.authentication.loading
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    setConfigKey,
    setConfig,
    logout
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

