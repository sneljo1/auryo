import * as actions from '@common/store/actions';
import { ConfigState } from '@common/store/config';
import cn from 'classnames';
import { debounce } from 'lodash';
import React from 'react';
import { autobind } from 'core-decorators';

interface Props {
  config: ConfigState;
  setConfigKey: typeof actions.setConfigKey;
  configKey: string;
  name: string;
  className?: string;
  description?: React.ReactNode;
  usePlaceholder: boolean;
  placeholder: string;
  invalid: boolean;
  type: string;
  onChange?(value: string | null, setKey: () => void): void;
}

@autobind
export class InputConfig extends React.PureComponent<Props> {
  private readonly saveDebounced: (value: string) => void;

  public static readonly defaultProps: Partial<Props> = {
    type: 'text',
    usePlaceholder: false,
    placeholder: '',
    className: '',
    invalid: false
  };

  constructor(props: Props) {
    super(props);

    this.saveDebounced = debounce(this.handleChange.bind(this), 50);
  }

  public handleChange(value: string) {
    const { configKey, onChange, setConfigKey } = this.props;

    const val = value.length ? value : null;

    if (onChange) {
      onChange(val, () => {
        setConfigKey(configKey, val);
      });
    } else {
      setConfigKey(configKey, val);
    }
  }

  public render() {
    const { configKey, name, config, type, className, usePlaceholder, placeholder, invalid, description } = this.props;

    const value = configKey.split('.').reduce((o, i) => o[i], config);
    const defaultValue = value || '';
    const placeholderText = usePlaceholder ? name : placeholder;

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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.saveDebounced(event.target.value)}
          placeholder={placeholderText}
          onKeyUp={e => e.stopPropagation()}
          defaultValue={defaultValue}
        />
      </div>
    );
  }
}
