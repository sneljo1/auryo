import cn from 'classnames';
import { debounce } from 'lodash';
import * as React from 'react';
import { ConfigState, setConfigKey } from '@common/store/config';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name: string;
    className?: string;
    description?: React.ReactNode;
    onChange?: (value: string | null, setKey: () => void) => void;
    usePlaceholder: boolean;
    placeholder: string;
    invalid: boolean;
    type: string;
}

class InputConfig extends React.PureComponent<Props> {

    static readonly defaultProps: Partial<Props> = {
        type: 'text',
        usePlaceholder: false,
        placeholder: '',
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

        const val = value.length ? value : null;

        if (onChange) {
            onChange(val, () => {
                setConfigKey(configKey, val);
            });
        } else {
            setConfigKey(configKey, val);
        }
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder, placeholder, invalid, description } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className={`setting${className} d-flex justify-content-between`}>
                <div>
                    {
                        !usePlaceholder && (
                            <label htmlFor={name}>{name}</label>
                        )
                    }

                    {
                        !!description && (
                            <div className='value'>{description}</div>
                        )
                    }
                </div>


                <input
                    type={type}
                    className={cn('form-control form-control-sm ', {
                        'is-invalid': invalid
                    })}
                    name={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.saveDebounced(event.target.value)}
                    placeholder={usePlaceholder ? name : placeholder}
                    defaultValue={value || ''}
                />
            </div>
        );
    }

}

export default InputConfig;
