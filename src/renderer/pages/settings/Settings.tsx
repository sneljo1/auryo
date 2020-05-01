import { Button, Collapse, Intent, Switch } from '@blueprintjs/core';
import fetchToJson from '@common/api/helpers/fetchToJson';
import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { SC } from '@common/utils';
import { ThemeKeys } from '@renderer/app/components/Theme/themes';
import PageHeader from '@renderer/_shared/PageHeader/PageHeader';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash-decorators';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { CONFIG } from '../../../config';
import { CheckboxConfig } from './components/CheckboxConfig';
import { InputConfig } from './components/InputConfig';
import { SelectConfig } from './components/SelectConfig';
import './Settings.scss';

const mapStateToProps = ({ config, auth, app }: StoreState) => ({
  config,
  authenticated: !!config.auth.token && !auth.authentication.loading,
  lastfmLoading: app.lastfmLoading
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setConfigKey: actions.setConfigKey,
      setConfig: actions.setConfig,
      logout: actions.logout,
      addToast: actions.addToast
    },
    dispatch
  );

interface Props {
  noHeader?: boolean;
}

interface State {
  restartMsg: boolean;
  advancedOpen: boolean;
  audioDevices: MediaDeviceInfo[];
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = Props & PropsFromState & PropsFromDispatch;

interface SettingGroup {
  name: string;
  settings: Setting[];
}

interface Setting {
  authenticated: boolean;
  setting: React.ReactNode;
}

@autobind
class Settings extends React.PureComponent<AllProps, State> {
  public static defaultProps: Partial<AllProps> = {
    authenticated: false
  };

  public readonly state: State = {
    restartMsg: false,
    advancedOpen: false,
    audioDevices: []
  };

  public async componentDidMount() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audiooutput');

    this.setState({
      audioDevices
    });
  }

  get settings(): SettingGroup[] {
    const { config, setConfigKey, lastfmLoading } = this.props;

    return [
      {
        name: 'General',
        settings: [
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="statistics"
                name="Send anonymous statistics"
                configKey="app.analytics"
                config={config}
                setConfigKey={setConfigKey}
              />
            )
          },
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="crashReports"
                name="Send crash reports"
                configKey="app.crashReports"
                config={config}
                setConfigKey={setConfigKey}
              />
            )
          },
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="showTrackChangeNotification"
                name="Show notification on track change"
                configKey="app.showTrackChangeNotification"
                config={config}
                setConfigKey={setConfigKey}
              />
            )
          },
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="logTrackChange"
                name="Log current playing track to /tmp/auryo_track.log"
                configKey="app.logTrackChange"
                config={config}
                setConfigKey={setConfigKey}
              />
            )
          },
          {
            authenticated: true,
            setting: (
              <SelectConfig
                key="theme"
                name="Theme"
                configKey="app.theme"
                setConfigKey={setConfigKey}
                config={config}
                data={Object.keys(ThemeKeys).map(theme => ({ k: theme, v: theme }))}
              />
            )
          },
          {
            authenticated: true,
            setting: (
              <div key="downloadPath" className="setting d-flex justify-content-between align-items-center">
                <div>
                  Download path
                  <div className="value">{'app.downloadPath'.split('.').reduce((o, i) => o[i], config)}</div>
                </div>
                <Button onClick={this.isValidDirectory}>Change directory</Button>
              </div>
            )
          },
          {
            authenticated: false,
            setting: (
              <InputConfig
                key="overrideClientId"
                config={config}
                setConfigKey={setConfigKey}
                configKey="app.overrideClientId"
                onChange={this.checkAndSaveClientId}
                type="text"
                name="Use your own clientId"
                placeholder="clientId"
                description={
                  <div>
                    Read <a href="https://github.com/Superjo149/auryo/wiki/Custom-clientId">here</a> why and how.
                  </div>
                }
              />
            )
          }
        ]
      },
      {
        name: 'Stream',
        settings: [
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="reposts"
                name="Hide reposts"
                configKey="hideReposts"
                config={config}
                setConfigKey={setConfigKey}
                onChange={(_value, setKey) => {
                  this.setState({
                    restartMsg: true
                  });
                  setKey();
                }}
              />
            )
          }
        ]
      },
      {
        name: 'Integrations',
        settings: [
          {
            authenticated: true,
            setting: (
              <div key="lastfm" className="setting d-flex justify-content-between align-items-start">
                <div>
                  LastFm integration
                  <div className="mt-1">
                    {!!config.lastfm && (
                      <>
                        {config.lastfm && config.lastfm.key ? (
                          <div className="value d-flex align-items-center">
                            <span>Authorized as {config.lastfm.user}</span>
                            <a role="button" onClick={() => setConfigKey('lastfm', null)} className="text-danger">
                              <i className="bx bx-x" />
                            </a>
                          </div>
                        ) : (
                          <Button loading={lastfmLoading} onClick={this.authorizeLastFm}>
                            Authorize
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Switch alignIndicator="right" large checked={!!config.lastfm} onChange={this.toggleLastFm} />
                </div>
              </div>
            )
          }
        ]
      },
      {
        name: 'Proxy (Experimental)',
        settings: [
          {
            authenticated: false,
            setting: (
              <div key="proxy">
                <CheckboxConfig
                  name="Enable proxy"
                  configKey="enableProxy"
                  {...this.props}
                  onChange={(_value, setKey) => {
                    this.setState({
                      restartMsg: true
                    });
                    setKey();
                  }}
                />

                {config.enableProxy ? (
                  <div className="container-fluid p-0 mt-2">
                    <div className="form-group form-row">
                      <InputConfig
                        usePlaceholder
                        className="col-8"
                        name="Host"
                        configKey="proxy.host"
                        {...this.props}
                      />
                      <InputConfig
                        usePlaceholder
                        className="col-4"
                        name="Port"
                        configKey="proxy.port"
                        {...this.props}
                      />
                    </div>
                    <div className="form-group form-row">
                      <InputConfig
                        usePlaceholder
                        className="col-6"
                        name="Username"
                        configKey="proxy.username"
                        {...this.props}
                      />
                      <InputConfig
                        usePlaceholder
                        className="col-6"
                        name="Password"
                        configKey="proxy.password"
                        {...this.props}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )
          }
        ]
      }
    ];
  }

  public restart() {
    ipcRenderer.send(EVENTS.APP.RESTART);
  }

  @debounce(800)
  public tryClientId(addToast: typeof actions.addToast, saveValue: Function, clientId: string) {
    fetchToJson(SC.getRemainingTracks(clientId))
      .then(remaining => {
        if (remaining) {
          saveValue();
          addToast({
            message: 'Your clientId has been set',
            intent: Intent.SUCCESS
          });
        }
      })
      .catch(() => {
        addToast({
          message: 'This clientId might not be correct',
          intent: Intent.DANGER
        });
      });
  }

  public checkAndSaveClientId(clientId: string, saveValue: () => void) {
    const { addToast } = this.props;

    if (clientId && clientId.length) {
      this.tryClientId(addToast, saveValue, clientId);
    } else {
      saveValue();
    }
  }

  public isValidDirectory() {
    const { setConfigKey } = this.props;

    ipcRenderer.send(EVENTS.APP.VALID_DIR);
    ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event, dir: string) => {
      setConfigKey('app.downloadPath', dir);
    });
  }

  private handleClick() {
    const { advancedOpen } = this.state;

    this.setState({ advancedOpen: !advancedOpen });
  }

  private toggleLastFm(event: React.ChangeEvent<HTMLInputElement>) {
    const { setConfigKey } = this.props;

    setConfigKey('lastfm', event.target.checked ? {} : null);
  }

  private authorizeLastFm() {
    ipcRenderer.send(EVENTS.APP.LASTFM.AUTH);
  }

  private renderSettings() {
    const { authenticated } = this.props;
    const { restartMsg, advancedOpen } = this.state;

    return (
      <>
        {restartMsg && (
          <div className="info-message">
            A{' '}
            <a href="javascript:void(0)" onClick={this.restart}>
              restart
            </a>{' '}
            is required to enable/disable this feature.
          </div>
        )}

        {this.settings.map(settingGroup => {
          const settings = settingGroup.settings
            .filter(setting => setting.authenticated === authenticated || setting.authenticated === false)
            .map(setting => setting.setting);

          if (!settings.length) {
            return null;
          }

          return (
            <div key={settingGroup.name} className="setting-group">
              <div className="setting-group-title">{settingGroup.name}</div>
              <div>{settings}</div>
            </div>
          );
        })}

        {authenticated && (
          <div className="my-3">
            <Button onClick={this.handleClick}>{advancedOpen ? 'Hide' : 'Show'} advanced settings</Button>
            <Collapse isOpen={advancedOpen}>{this.renderAdvancedSettings()}</Collapse>
          </div>
        )}
      </>
    );
  }

  private renderAdvancedSettings() {
    const { setConfig, logout, config, setConfigKey } = this.props;

    const { audioDevices } = this.state;

    return (
      <div className="setting-group mt-2">
        <div className="setting-group-title">Advanced settings</div>

        <SelectConfig
          name="Audio output"
          setConfigKey={setConfigKey}
          config={config}
          data={[{ k: 'Use device settings', v: null }, ...audioDevices.map(d => ({ k: d.label, v: d.deviceId }))]}
          configKey="audio.playbackDeviceId"
        />

        <div className="setting">
          <a
            role="button"
            onClick={() => {
              setConfig(CONFIG.DEFAULT_CONFIG);
              logout();
            }}
            className="text-danger">
            Delete all settings
          </a>
        </div>
      </div>
    );
  }

  public render() {
    const { authenticated } = this.props;

    return (
      <>
        <PageHeader title="Settings" />

        <div className="settingsWrapper">
          {authenticated && (
            <div className="donationBox">
              <div className="iconWrapper">
                <i className="bx bxs-heart" />
              </div>
              <div>
                <strong>Are you enjoying this app as much as I am? Or even more?</strong>
                <div>
                  I would love to spend more time on this, and other open-source projects. I do not earn anything off
                  this project, so I would highly appreciate any financial contribution towards this goal.
                  <a href="https://github.com/sponsors/Superjo149">Contribute now</a>
                </div>
              </div>
            </div>
          )}

          {this.renderSettings()}
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
