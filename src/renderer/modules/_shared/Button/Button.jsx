import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

class Button extends React.PureComponent {
    static propTypes = {
        loading: PropTypes.bool,
        block: PropTypes.bool,
        color: PropTypes.oneOf(['primary', 'danger', 'success', 'warning'])
    };

    static defaultProps = {
        loading: false,
        block: false,
        color: 'primary'
    };

    render() {
        const { loading, color, block, ...rest } = this.props;

        return (
            <a className={cn(`btn btn-${color}`, {
                'btn-block': block,
                loading
            })} {...rest}>
                {
                    loading ? [
                        <div key="loader" className="circle-loader" />,
                        <span key="text">Loading</span>
                    ] : this.props.children
                }

            </a>
        );
    }
}

export default Button;