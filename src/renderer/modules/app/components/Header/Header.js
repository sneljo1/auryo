import React from 'react'
import PropTypes from 'prop-types'
import { browserHistory, withRouter } from 'react-router'
import { connect } from 'react-redux'
import './header.scss'
import User from './User/user.component'
import SearchBox from './Search/searchBox.component'
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import Sticky from '../../../_shared/Sticky'
import isEqual from 'lodash/isEqual'
import * as actions from '../../../../../shared/actions/index'

class Header extends React.Component {

    state = {
        dropdownOpen: false,
        height: 0
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.state.dropdownOpen !== nextState.dropdownOpen ||
            !isEqual(this.props.location.pathname, nextProps.location.pathname) ||
            !isEqual(this.props.locHistory, nextProps.locHistory) ||
            this.props.me !== nextProps.me ||
            (this.props.scrollTop < 52 && nextProps.scrollTop > 52) || (this.props.scrollTop > 52 && nextProps.scrollTop < 52)
    }

    componentDidMount() {
        this.setState({
            height: this.divElement.clientHeight
        })

        if (this.props.focus) {
            this.search.focus()
        }
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    goBack() {
        const { locHistory: { back }, history } = this.props
        if (back) {
            history.goBack()
        }
    }

    goForward() {
        const { locHistory: { next }, history } = this.props
        if (next) {
            history.goForward()
        }
    }

    showUtilitiesModal = (activeTab) => {
        this.props.show('utilities', {
            activeTab
        })

        this.toggle()
    }

    render() {
        const { locHistory: { next, back }, push, me, logout, scrollTop, replace, className } = this.props

        return (
            <div className={'header-wrapper ' + className || ""} style={{ minHeight: this.state.height }}>
                <Sticky
                    className="stickymaker"
                    activeClassName={`sticky sticky-3`}
                    stickyWidth={`calc(100% - ${260}px)`}
                    isSticky={scrollTop - 52 > 0}
                >

                    <div className="navbar-wrapper" ref={(divElement) => this.divElement = divElement}>
                        <nav className="navbar">
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
                                <SearchBox ref={r => this.search = r} initialValue={this.props.query}
                                           handleSearch={(prev, query) => {
                                               if (prev) {
                                                   replace(`/search/${query}`)
                                               } else {
                                                   push(`/search/${query}`)
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
                        <div>{this.props.children && this.props.children}</div>
                    </div>
                </Sticky>
            </div>
        )
    }
}

Header.propTypes = {
    history: PropTypes.object.isRequired,
    className: PropTypes.string,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    me: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired,
    query: PropTypes.string
}

Header.defaultProps = {
    scrollTop: 0,
    query: ''
}

const mapStateToProps = (state) => {
    const { auth, app } = state

    return {
        me: auth.me,
        app,
        locHistory: app.history
    }
}


export default withRouter(connect(mapStateToProps, actions)(Header))