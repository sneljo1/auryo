import React from 'react';
import './switch.scss';
import PropTypes from 'prop-types';

class Switch extends React.PureComponent {

    static propTypes = {
        checked: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        id: PropTypes.string
    };

    render() {

        const id = `switch-${this.props.id}`;

        return (
            <span className="switch switch-sm">
              <input type="checkbox" className="switch"
                     defaultChecked={this.props.checked}
                     id={id}
                     onChange={this.props.onChange} />
              <label htmlFor={id}></label>
            </span>
        );
    }

}


export default Switch;
