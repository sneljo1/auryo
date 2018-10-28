import { Switch } from '@blueprintjs/core';
import * as React from 'react';
import { ConfigState, setConfigKey } from '../../../../../../../../common/store/config';

interface Props {
    config: ConfigState;
    setConfigKey: typeof setConfigKey;
    configKey: string;
    name: string;
    className?: string;
    onChange?: (value: boolean, setKey: () => void) => void;
}


class CheckboxConfig extends React.Component<Props> {

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { configKey, setConfigKey, onChange } = this.props;

        if (onChange) {
            onChange(e.target.checked, () => {
                setConfigKey(configKey, e.target.checked);
            });
        } else {
            setConfigKey(configKey, e.target.checked);
        }
    }

    render() {
        const { configKey, name, config } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className='setting'>
                <Switch
                    inline={true}
                    large={true}
                    label={name}
                    checked={value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }

}

export default CheckboxConfig;
