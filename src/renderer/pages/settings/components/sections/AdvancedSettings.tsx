import { Button, Collapse } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import { isAuthenticatedSelector } from '@common/store/selectors';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CONFIG } from 'src/config';
import { SelectConfig } from '../SelectConfig';

export const AdvancedSettings: FC = () => {
  const dispatch = useDispatch();
  const authenticated = useSelector(isAuthenticatedSelector);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    const initAudioDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput');

      setAudioDevices(audioDevices);
    };

    initAudioDevices();
  }, []);

  const toggleAdvanced = useCallback(() => {
    setIsAdvancedOpen(!isAdvancedOpen);
  }, [isAdvancedOpen]);

  if (!authenticated) return null;

  return (
    <div className="my-3">
      <Button onClick={toggleAdvanced}>{isAdvancedOpen ? 'Hide' : 'Show'} advanced settings</Button>
      <Collapse isOpen={isAdvancedOpen}>
        <div className="setting-group mt-2">
          <div className="setting-group-title">Advanced settings</div>

          <SelectConfig
            name="Audio output"
            data={[{ k: 'Use device settings', v: null }, ...audioDevices.map(d => ({ k: d.label, v: d.deviceId }))]}
            configKey="audio.playbackDeviceId"
          />

          <div className="setting">
            <a
              role="button"
              onClick={() => {
                // TODO should be an action
                dispatch(actions.setConfig(CONFIG.DEFAULT_CONFIG));
                dispatch(actions.logout());
              }}
              className="text-danger">
              Delete all settings
            </a>
          </div>
        </div>
      </Collapse>
    </div>
  );
};
