import * as actions from '@common/store/actions';
import { configSelector } from '@common/store/selectors';
import cn from 'classnames';
import { debounce } from 'lodash';
import React, { FC, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  configKey: string;
  name: string;
  className?: string;
  description?: React.ReactNode;
  usePlaceholder?: boolean;
  placeholder: string;
  invalid?: boolean;
  type: string;
  onChange?(value: string | null, setKey: () => void): void;
}

export const InputConfig: FC<Props> = ({
  configKey,
  name,
  type = 'text',
  className = '',
  usePlaceholder = false,
  placeholder = '',
  invalid,
  description,
  onChange: propagateOnChange
}) => {
  const dispatch = useDispatch();
  const config = useSelector(configSelector);

  const value = configKey.split('.').reduce((o, i) => o[i], config);
  const defaultValue = value || '';
  const placeholderText = usePlaceholder ? name : placeholder;

  const onChange = useCallback(
    (value: string) => {
      const val = value.length ? value : null;

      if (propagateOnChange) {
        propagateOnChange(val, () => {
          dispatch(actions.setConfigKey(configKey, val));
        });
      } else {
        dispatch(actions.setConfigKey(configKey, val));
      }
    },
    [configKey, dispatch, propagateOnChange]
  );

  const saveDebounced = useRef(debounce(onChange, 50));

  return (
    <div className={`setting${className} d-flex justify-content-between`}>
      <div>
        {!usePlaceholder && <label htmlFor={name}>{name}</label>}

        {!!description && <div className="value">{description}</div>}
      </div>

      <input
        type={type}
        className={cn('form-control form-control-sm ', {
          'is-invalid': invalid
        })}
        name={name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => saveDebounced.current(event.target.value)}
        placeholder={placeholderText}
        onKeyUp={e => e.stopPropagation()}
        defaultValue={defaultValue}
      />
    </div>
  );
};
