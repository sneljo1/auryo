import PropTypes from 'prop-types';
import React from 'react';

class SelectConfig extends React.Component {

    handleChange = (e) => {
        const { configKey, setConfigKey, onChange } = this.props

        setConfigKey(configKey, e.target.value)

        if (onChange) {
            onChange(e.target.value)
        }
    }


    render() {
        const { configKey, name, config, className, usePlaceholder, data } = this.props

        const value = configKey.split('.').reduce((o, i) => o[i], config)

        return (
            <div className={`setting d-flex justify-content-between align-items-center ${className}`}>
                {
                    !usePlaceholder && <span>{name}</span>
                }
                <select className="form-control form-control-sm" onChange={this.handleChange} defaultValue={value || ''}>
                    {
                        data.map(({ k, v }) => (
                            <option value={v}>{k}</option>
                        ))
                    }
                </select>
            </div>
        )
    }

}

SelectConfig.propTypes = {
    config: PropTypes.object.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    configKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    className: PropTypes.string,
    onChange: PropTypes.func,
    usePlaceholder: PropTypes.bool
}
SelectConfig.defaultProps = {
    onChange: null,
    usePlaceholder: false,
    className: "",
    data:[]
}

export default SelectConfig
