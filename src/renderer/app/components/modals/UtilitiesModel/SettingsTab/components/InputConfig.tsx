import cn from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import { ConfigState, setConfigKey } from '../../../../../../../common/store/config';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name: string;
    className?: string;
    onChange?: (value: string, setKey: () => void) => void;
    usePlaceholder: boolean;
    invalid: boolean;
    type: string;
}

class InputConfig extends React.PureComponent<Props> {

    static readonly defaultProps: Partial<Props> = {
        type: 'text',
        usePlaceholder: false,
        className: '',
        invalid: false
    };

    private saveDebounced: (value: string) => void;

    constructor(props: Props) {
        super(props);

        this.saveDebounced = debounce(this.handleChange.bind(this), 50);
    }

    handleChange = (value: string) => {
        const { configKey, onChange, setConfigKey } = this.props;

        if (onChange) {
            onChange(value, () => {
                setConfigKey(configKey, value);
            });
        } else {
            setConfigKey(configKey, value);
        }
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder, invalid } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className={`setting${className}`}>
                {
                    !usePlaceholder && (
                        <label htmlFor={name}>{name}</label>
                    )
                }

                <input
                    type={type}
                    className={cn('form-control form-control-sm ', {
                        'is-invalid': invalid
                    })}
                    name={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.saveDebounced(event.target.value)}
                    placeholder={usePlaceholder ? name : undefined}
                    defaultValue={value || ''}
                />
            </div>
        );
    }

}

export default InputConfig;
