import { Button, Intent, Switch } from '@blueprintjs/core';
import fetchToJson from '@common/api/helpers/fetchToJson';
import { EVENTS } from '@common/constants/events';
import * as actions from '@common/store/actions';
import { lastFmLoadingSelector } from '@common/store/app/selectors';
import { configSelector, isAuthenticatedSelector } from '@common/store/selectors';
import { SC } from '@common/utils';
import { ThemeKeys } from '@renderer/app/components/Theme/themes';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash';
import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckboxConfig } from '../CheckboxConfig';
import { SelectConfig } from '../SelectConfig';

export interface SettingGroup {
  name: string;
  settings: Setting[];
}

interface Setting {
  authenticated: boolean;
  setting: React.ReactNode;
}

interface Props {
  onShouldRestart(): void;
}

export const MainSettings: FC<Props> = ({ onShouldRestart }) => {
  const dispatch = useDispatch();
  const authenticated = useSelector(isAuthenticatedSelector);
  const lastfmLoading = useSelector(lastFmLoadingSelector);
  const config = useSelector(configSelector);

  // TODO refactor to redux-observables
  const authorizeLastFm = useCallback(() => {
    ipcRenderer.send(EVENTS.APP.LASTFM.AUTH);
  }, []);

  const isValidDirectory = useCallback(() => {
    ipcRenderer.send(EVENTS.APP.VALID_DIR);
    ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event, dir: string) => {
      dispatch(actions.setConfigKey('app.downloadPath', dir));
    });
  }, [dispatch]);

  const tryClientId = useCallback(
    (saveValue: Function, clientId: string) => {
      fetchToJson(SC.getRemainingTracks(clientId))
        .then(remaining => {
          if (remaining) {
            saveValue();
            dispatch(
              actions.addToast({
                message: 'Your clientId has been set',
                intent: Intent.SUCCESS
              })
            );
          }
        })
        .catch(() => {
          dispatch(
            actions.addToast({
              message: 'This clientId might not be correct',
              intent: Intent.DANGER
            })
          );
        });
    },
    [dispatch]
  );

  const debounceTryClientId = useRef(debounce(tryClientId, 800));

  const checkAndSaveClientId = useCallback((clientId: string, saveValue: () => void) => {
    if (clientId?.length === 32) {
      debounceTryClientId.current(saveValue, clientId);
    } else {
      saveValue();
    }
  }, []);

  const settings = useMemo((): SettingGroup[] => {
    return [
      {
        name: 'General',
        settings: [
          {
            authenticated: true,
            setting: <CheckboxConfig key="statistics" name="Send anonymous statistics" configKey="app.analytics" />
          },
          {
            authenticated: true,
            setting: <CheckboxConfig key="crashReports" name="Send crash reports" configKey="app.crashReports" />
          },
          {
            authenticated: true,
            setting: (
              <CheckboxConfig
                key="showTrackChangeNotification"
                name="Show notification on track change"
                configKey="app.showTrackChangeNotification"
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
                <Button onClick={isValidDirectory}>Change directory</Button>
              </div>
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
                onChange={(_value, setKey) => {
                  onShouldRestart();
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
                            <a
                              role="button"
                              onClick={() => dispatch(actions.setConfigKey('lastfm', null))}
                              className="text-danger">
                              <i className="bx bx-x" />
                            </a>
                          </div>
                        ) : (
                          <Button loading={lastfmLoading} onClick={authorizeLastFm}>
                            Authorize
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Switch
                    alignIndicator="right"
                    large
                    checked={!!config.lastfm}
                    onChange={event => {
                      dispatch(actions.setConfigKey('lastfm', (event.target as any).checked ? {} : null));
                    }}
                  />
                </div>
              </div>
            )
          }
        ]
      }
      // {
      //   name: 'Proxy (Experimental)',
      //   settings: [
      //     {
      //       authenticated: false,
      //       setting: (
      //         <div key="proxy">
      //           <CheckboxConfig
      //             name="Enable proxy"
      //             configKey="enableProxy"
      //             {...this.props}
      //             onChange={(_value, setKey) => {
      //               this.setState({
      //                 restartMsg: true
      //               });
      //               setKey();
      //             }}
      //           />

      //           {config.enableProxy ? (
      //             <div className="container-fluid p-0 mt-2">
      //               <div className="form-group form-row">
      //                 <InputConfig
      //                   usePlaceholder
      //                   className="col-8"
      //                   name="Host"
      //                   configKey="proxy.host"
      //                   {...this.props}
      //                 />
      //                 <InputConfig
      //                   usePlaceholder
      //                   className="col-4"
      //                   name="Port"
      //                   configKey="proxy.port"
      //                   {...this.props}
      //                 />
      //               </div>
      //               <div className="form-group form-row">
      //                 <InputConfig
      //                   usePlaceholder
      //                   className="col-6"
      //                   name="Username"
      //                   configKey="proxy.username"
      //                   {...this.props}
      //                 />
      //                 <InputConfig
      //                   usePlaceholder
      //                   className="col-6"
      //                   name="Password"
      //                   configKey="proxy.password"
      //                   {...this.props}
      //                 />
      //               </div>
      //             </div>
      //           ) : null}
      //         </div>
      //       )
      //     }
      //   ]
      // }
    ];
  }, [authorizeLastFm, checkAndSaveClientId, config, dispatch, isValidDirectory, lastfmLoading]);

  return (
    <div>
      {settings.map(settingGroup => {
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
    </div>
  );
};
