import cn from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class ToggleMore extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false,
            overflow: false,
            check_height: props.height || 200,
            max: null,
            current_height: props.height || 200
        }
    }

    componentDidMount() {
        const height = this.overflow.clientHeight
        const { overflow, check_height } = this.state

        if (height > check_height && !overflow) {
            this.setState({
                overflow: true,
                max: height
            })
        }

    }

    toggleOpen() {
        const { open, current_height, max, check_height } = this.state

        this.setState({
            open: !open,
            current_height: current_height === max ? check_height : max
        })
    }

    render() {
        const { overflow, open, current_height } = this.state
        const { className, children } = this.props

        if (!overflow) {
            return (
                <div ref={r => this.overflow = r} className={className}>
                    {children}
                </div>
            )
        }

        return (
            <div className={cn('overflow-container', className, { open })}>
                <div className="overflow-div" ref={r => this.overflow = r} style={{
                    height: current_height
                }}>
                    {children}
                </div>
                <div className="overflow-bottom">
                    <a className="overflow-button" href="javascript:void(0)" onClick={(this.toggleOpen.bind(this))}>
                        <i className={`icon-${open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}`} />
                    </a>
                </div>
            </div>
        )
    }

}

ToggleMore.propTypes = {
    height: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.any,
}
ToggleMore.defaultProps = {
    className: '',
    height: 200,
    children: null
}

export default ToggleMore