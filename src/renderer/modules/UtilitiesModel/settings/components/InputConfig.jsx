import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import cn from "classnames";

class InputConfig extends React.PureComponent {

    constructor() {
        super()

        this.saveDebounced = debounce(this.handleChange.bind(this), 50)
    }

    handleChange = () => {
        const { configKey, onChange, setConfigKey } = this.props

        if (onChange) {
            onChange(this.input.value, setConfigKey.bind(this, configKey, this.input.value))
        } else {
            setConfigKey(configKey, this.input.value)
        }
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder, invalid } = this.props

        const value = configKey.split('.').reduce((o, i) => o[i], config)

        return (
            <div className={`setting${className}`}>
                {
                    !usePlaceholder && <label htmlFor={name}>{name}</label>
                }
                <input type={type || 'text'}
                    className={cn("form-control form-control-sm ", {
                        "is-invalid": invalid
                    })}
                    name={name}
                    onChange={this.saveDebounced}
                    ref={r => this.input = r}
                    placeholder={usePlaceholder ? name : undefined}
                    defaultValue={value || ''} />
            </div>
        )
    }

}

InputConfig.propTypes = {
    config: PropTypes.object.isRequired,
    setConfigKey: PropTypes.func.isRequired,
    configKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    usePlaceholder: PropTypes.bool,
    invalid: PropTypes.bool,
}
InputConfig.defaultProps = {
    type: null,
    onChange: null,
    usePlaceholder: false,
    className: "",
    invalid: false
}

export default InputConfig
