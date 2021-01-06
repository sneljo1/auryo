import * as actions from '@common/store/actions';
import { configSelector } from '@common/store/selectors';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  configKey: string;
  name: string;
  data: { k: string; v: any }[];
  className?: string;
  usePlaceholder?: boolean;
  onChange?(value: string): void;
}

export const SelectConfig: FC<Props> = ({
  configKey,
  name,
  className = '',
  usePlaceholder,
  data = [],
  onChange: propagateOnChange
}) => {
  const dispatch = useDispatch();
  const config = useSelector(configSelector);

  const value = configKey.split('.').reduce((o, i) => o[i], config);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(actions.setConfigKey(configKey, e.currentTarget.value));

      if (propagateOnChange) {
        propagateOnChange(e.currentTarget.value);
      }
    },
    [configKey, dispatch, propagateOnChange]
  );

  return (
    <div className={`setting d-flex justify-content-between align-items-center ${className}`}>
      {!usePlaceholder && <span>{name}</span>}
      <select className="form-control form-control-sm" onBlur={onChange} onChange={onChange} defaultValue={value || ''}>
        {data.map(({ k, v }) => (
          <option value={v} key={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  );
};
