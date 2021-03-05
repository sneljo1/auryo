import { Button, Switch } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import * as actions from '@common/store/actions';
import { connectLastFm } from '@common/store/actions';
import { lastFmLoadingSelector } from '@common/store/app/selectors';
import { configSelector, isAuthenticatedSelector } from '@common/store/selectors';
import { ThemeKeys } from '@renderer/app/components/Theme/themes';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React, { FC, useCallback, useMemo } from 'react';
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

  const authorizeLastFm = useCallback(() => {
    dispatch(connectLastFm.request());
  }, [dispatch]);

  const isValidDirectory = useCallback(() => {
    ipcRenderer.send(EVENTS.APP.VALID_DIR);
    ipcRenderer.once(EVENTS.APP.VALID_DIR_RESPONSE, (_event, dir: string) => {
      dispatch(actions.setConfigKey('app.downloadPath', dir));
    });
  }, [dispatch]);

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
                data={Object.keys(ThemeKeys).map((theme) => ({ k: theme, v: theme }))}
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
                    onChange={(event) => {
                      dispatch(actions.setConfigKey('lastfm', (event.target as any).checked ? {} : null));
                    }}
                  />
                </div>
              </div>
            )
          }
        ]
      }
    ];
  }, [authorizeLastFm, config, dispatch, isValidDirectory, lastfmLoading, onShouldRestart]);

  return (
    <div>
      {settings.map((settingGroup) => {
        const settings = settingGroup.settings
          .filter((setting) => setting.authenticated === authenticated || setting.authenticated === false)
          .map((setting) => setting.setting);

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
