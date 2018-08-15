import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import cn from "classnames";

class InputConfig extends React.PureComponent {

    static propTypes = {
        config: PropTypes.object,
        setConfigKey: PropTypes.func,
        configKey: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func,
        usePlaceholder: PropTypes.bool,
        invalid: PropTypes.bool
    }

    static defaultProps = {
        className: "",
        invalid: false
    }

    constructor() {
        super()

        this.state = {
            isChecked: null
        }

        this.saveDebounced = debounce(this._handleChange.bind(this), 50)
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder } = this.props

        const value = configKey.split('.').reduce((o, i) => o[i], config)

        return (
            <div className={`setting${className}`}>
                {
                    !usePlaceholder && <label>{name}</label>
                }
                <input type={type || 'text'}
                    className={cn("form-control form-control-sm ", {
                        "is-invalid": this.props.invalid
                    })}
                    onChange={this.saveDebounced}
                    ref={r => this.input = r}
                    placeholder={usePlaceholder ? name : undefined}
                    defaultValue={value || ''} />
            </div>
        )
    }

    _handleChange(e, v) {
        const { configKey } = this.props

        if (this.props.onChange) {
            this.props.onChange(this.input.value, this.props.setConfigKey.bind(this, configKey, this.input.value))
        } else {
            this.props.setConfigKey(configKey, this.input.value)
        }
    }

}


export default InputConfig
