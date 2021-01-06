import { Switch } from '@blueprintjs/core';
import * as actions from '@common/store/actions';
import { configSelector } from '@common/store/selectors';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  configKey: string;
  name?: string;
  alignIndicator?: 'right' | 'left' | 'center';
  className?: string;
  onChange?(value: boolean, setKey: () => void): void;
}

export const CheckboxConfig: FC<Props> = ({ configKey, name, alignIndicator, onChange: propagateOnChange }) => {
  const dispatch = useDispatch();
  const config = useSelector(configSelector);

  const value = configKey.split('.').reduce((o, i) => o[i], config);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (propagateOnChange) {
        propagateOnChange(e.target.checked, () => {
          dispatch(actions.setConfigKey(configKey, e.target.checked));
        });
      } else {
        dispatch(actions.setConfigKey(configKey, e.target.checked));
      }
    },
    [configKey, dispatch, propagateOnChange]
  );

  return (
    <div className="setting">
      <Switch alignIndicator={alignIndicator || 'right'} large label={name} checked={value} onChange={onChange} />
    </div>
  );
};
