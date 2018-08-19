import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@blueprintjs/core';

class CheckboxConfig extends React.PureComponent {

    handleChange = (e) => {
        const { configKey, setConfigKey, onChange } = this.props;

        setConfigKey(configKey, e.target.checked);

        if (onChange) {
            onChange(e.target.checked);
        }
    }

    render() {
        const { configKey, name, config } = this.props;

        const value = configKey.split('.').reduce((o, i) => o[i], config);

        return (
            <div className="setting">
                <Switch inline large label={name} checked={value} onChange={this.handleChange} />
            </div>
        );
    }

}

CheckboxConfig.propTypes = {
    config: PropTypes.object.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    configKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
}
CheckboxConfig.defaultProps = {
    onChange: null,
}


export default CheckboxConfig;
