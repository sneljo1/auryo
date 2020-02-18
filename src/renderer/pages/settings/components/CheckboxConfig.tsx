import { Switch } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import { ConfigState } from '@common/store/config';
import React from 'react';
import { autobind } from 'core-decorators';

interface Props {
  config: ConfigState;
  setConfigKey: typeof actions.setConfigKey;
  configKey: string;
  name?: string;
  alignIndicator?: 'right' | 'left' | 'center';
  className?: string;
  onChange?(value: boolean, setKey: () => void): void;
}

@autobind
export class CheckboxConfig extends React.Component<Props> {
  public handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { configKey, setConfigKey, onChange } = this.props;

    if (onChange) {
      onChange(e.target.checked, () => {
        setConfigKey(configKey, e.target.checked);
      });
    } else {
      setConfigKey(configKey, e.target.checked);
    }
  }

  public render() {
    const { configKey, name, config, alignIndicator } = this.props;

    const value = configKey.split('.').reduce((o, i) => o[i], config);

    return (
      <div className="setting">
        <Switch
          alignIndicator={alignIndicator || 'right'}
          large
          label={name}
          checked={value}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
