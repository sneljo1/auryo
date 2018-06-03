import React, { Component } from 'react'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

class MoreActionsDropdown extends Component {

    constructor(props) {
        super(props)

        this.toggleDropdown = this.toggleDropdown.bind(this)

        this.state = {
            dropdownOpen: false
        }
    }

    toggleDropdown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    render() {

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                <DropdownToggle tag="a" href="javascript:void(0)" className="c_btn round">
                    <i className="icon-more_horiz" />
                </DropdownToggle>
                <DropdownMenu right>
                    {this.props.children}
                </DropdownMenu>
            </Dropdown>
        )
    }
}

export default MoreActionsDropdown
