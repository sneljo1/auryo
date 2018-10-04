import cn from 'classnames';
import debounce from 'lodash/debounce';
import React from 'react';
import { ConfigState, setConfigKey } from '../../../../../../../../shared/store/config';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name: string;
    className?: string;
    onChange?: (value: string, setKey: Function) => void;
    usePlaceholder: boolean;
    invalid: boolean;
    type: string;
}

class InputConfig extends React.PureComponent<Props> {

    static defaultProps = {
        type: null,
        onChange: null,
        usePlaceholder: false,
        className: '',
        invalid: false
    };

    private saveDebounced: (event: React.ChangeEvent<HTMLInputElement>) => void;

    constructor(props: Props) {
        super(props);

        this.saveDebounced = debounce(this.handleChange.bind(this), 50);
    }

    handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const { configKey, onChange, setConfigKey } = this.props;

        if (onChange) {
            onChange(event.currentTarget.value, () => {
                setConfigKey(configKey, event.currentTarget.value)
            });
        } else {
            setConfigKey(configKey, event.currentTarget.value);
        }
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder, invalid } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className={`setting${className}`}>
                {
                    !usePlaceholder && <label htmlFor={name}>{name}</label>}
                <input type={type || 'text'}
                    className={cn('form-control form-control-sm ', {
                        'is-invalid': invalid
                    })}
                    name={name}
                    onChange={this.saveDebounced}
                    placeholder={usePlaceholder ? name : undefined}
                    defaultValue={value || ''} />
            </div>
        );
    }

}

export default InputConfig;
