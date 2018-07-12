import React from 'react'
import PropTypes from 'prop-types'
import { browserHistory } from 'react-router'
import './header.scss'
import User from './User/user.component'
import SearchBox from './Search/searchBox.component'
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import Sticky from '../../../_shared/Sticky'

class Header extends React.Component {

    state = {
        dropdownOpen: false,
        query: ''
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.state !== nextState) {
            return true
        }

        if (this.props.history !== nextProps.history) {
            return true
        }

        if (this.props.me !== nextProps.me) {
            return true
        }

        if ((this.props.scrollTop < 52 && nextProps.scrollTop > 52) || (this.props.scrollTop > 52 && nextProps.scrollTop < 52)) {
            return true
        }

        return false
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    goBack() {
        const { history: { back }, goBack } = this.props
        if (back) {
            goBack()
        }
    }

    goForward() {
        const { history: { next }, goForward } = this.props
        if (next) {
            goForward()
        }
    }

    showUtilitiesModal = (activeTab) => {
        this.props.show('utilities', {
            activeTab
        })

        this.toggle()
    }

    render() {
        const { history: { next, back }, push, me, logout, scrollTop, replace } = this.props

        return (
            <div className="header-wrapper">
                <Sticky
                    activeClassName={`sticky sticky-3`}
                    stickyWidth={`calc(100% - ${260}px)`}
                    isSticky={scrollTop - 52 > 0}
                >

                    <nav className="navbar justify-content-between">
                        <div className="d-flex flex-nowrap align-items-center">
                            <div className="control-nav">
                                <div className="control-nav-inner flex">
                                    <a className={!back ? 'disabled' : null}
                                       href="javascript:void(0)"
                                       onClick={this.goBack.bind(this)}>
                                        <i className="icon-keyboard_arrow_left" />
                                    </a>
                                    <a className={!next ? 'disabled' : null}
                                       href="javascript:void(0)"
                                       onClick={this.goForward.bind(this)}>
                                        <i className="icon-keyboard_arrow_right" />
                                    </a>
                                </div>
                            </div>
                            <SearchBox handleSearch={(prev, query) => {
                                if (query) {
                                    if (prev) {
                                        replace(`/search/${query}`)
                                    } else {
                                        push(`/search/${query}`)
                                    }
                                } else {
                                    push('/')
                                }
                            }} />
                        </div>

                        <div className="d-flex align-items-center justify-content-between">
                            <User me={me} push={push} />

                            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}
                                            className="d-flex align-items-center">
                                <DropdownToggle tag="a" className="toggle" href="javascript:void(0)">
                                    <i className="icon-more-vertical" />
                                </DropdownToggle>
                                <DropdownMenu right>


                                    <a href="javascript:void(0)" className="dropdown-item"
                                       onClick={this.showUtilitiesModal.bind(this, 'about')}>About</a>

                                    <a href="javascript:void(0)" className="dropdown-item"
                                       onClick={this.showUtilitiesModal.bind(this, 'settings')}>Settings</a>

                                    <DropdownItem divider />

                                    <a href="https://github.com/Superjo149/auryo/issues" className="dropdown-item">
                                        Report an issue
                                    </a>
                                    <a href="https://github.com/Superjo149/auryo/issues" className="dropdown-item">
                                        Suggest a feature
                                    </a>
                                    <a href="http://auryo.com/#donate" className="dropdown-item">
                                        Donate
                                    </a>

                                    <DropdownItem divider />

                                    <a href="javascript:void(0)" className="dropdown-item"
                                       onClick={() => logout()}>Logout</a>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </div>
                    </nav>
                </Sticky>
            </div>
        )
    }
}

Header.propTypes = {
    history: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    me: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    goForward: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired
}

Header.defaultProps = {
    scrollTop: 0
}

export default Header