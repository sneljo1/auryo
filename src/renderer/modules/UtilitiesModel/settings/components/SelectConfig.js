import React from 'react'
import PropTypes from 'prop-types'

class SelectConfig extends React.Component {

    static propTypes = {
        config: PropTypes.object,
        setConfigKey: PropTypes.func,
        configKey: PropTypes.string,
        name: PropTypes.string,
        data: PropTypes.array,
        className: PropTypes.string,
        onChange: PropTypes.func,
        usePlaceholder: PropTypes.bool
    }

    constructor() {
        super()

        this.state = {
            isChecked: null
        }

        this._handleChange = this._handleChange.bind(this)
    }


    render() {
        const { configKey, name, config, className, usePlaceholder, data } = this.props

        const value = configKey.split('.').reduce((o, i) => o[i], config)

        return (
            <div className={`setting d-flex justify-content-between align-items-center ${className}`}>
                {
                    !usePlaceholder && <span>{name}</span>
                }
                <select className="form-control form-control-sm" onChange={this._handleChange} defaultValue={value || ''}>
                    {
                        data.map(({ key, value }) => (
                            <option value={value}>{key}</option>
                        ))
                    }
                </select>
            </div>
        )
    }


    _handleChange(e) {
        const { configKey } = this.props

        this.props.setConfigKey(configKey, e.target.value)

        if (this.props.onChange) {
            this.props.onChange(e.target.value)
        }
    }

}


export default SelectConfig
