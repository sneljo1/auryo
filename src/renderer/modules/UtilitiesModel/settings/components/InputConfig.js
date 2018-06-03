import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

class InputConfig extends React.Component {

    static propTypes = {
        config: PropTypes.object,
        setConfigKey: PropTypes.func,
        configKey: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func,
        usePlaceholder: PropTypes.bool
    }

    constructor() {
        super()

        this.state = {
            isChecked: null
        }

        this.saveDebounced = debounce(this._handleChange.bind(this), 20)
    }


    render() {
        const { configKey, name, config, type, className, usePlaceholder } = this.props

        const value = configKey.split('.').reduce((o, i) => o[i], config)

        return (
            <div className={`setting d-flex justify-content-between align-items-center ${className}`}>
                {
                    !usePlaceholder && <span>{name}</span>
                }
                <input type={type || 'text'}
                       className="form-control form-control-sm"
                       onChange={this.saveDebounced}
                       ref={r => this.input = r}
                       placeholder={usePlaceholder ? name : undefined}
                       defaultValue={value || ''} />
            </div>
        )
    }


    _handleChange(e, v) {
        const { configKey } = this.props

        this.props.setConfigKey(configKey, this.input.value)


        if (this.props.onChange) {
            this.props.onChange(this.input.value)
        }
    }

}


export default InputConfig
