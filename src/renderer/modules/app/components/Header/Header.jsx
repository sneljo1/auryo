import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import * as actions from '../../../../../shared/actions/index';
import Sticky from '../../../_shared/Sticky';
import './header.scss';
import SearchBox from './Search/SearchBox';
import User from './User/AuthUser';

class Header extends React.Component {

    state = {
        dropdownOpen: false,
        height: 0
    }

    componentDidMount() {
        const { focus } = this.props;

        this.setState({
            height: this.divElement.clientHeight
        })

        if (focus) {
            this.search.focus()
        }
    }

    componentWillReceiveProps() {
        const { height } = this.state;
        if (height !== this.divElement.clientHeight) {
            this.setState({
                height: this.divElement.clientHeight
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { dropdownOpen } = this.state;
        const { scrollTop, location, locHistory, me } = this.props;

        return dropdownOpen !== nextState.dropdownOpen ||
            !isEqual(location.pathname, nextProps.location.pathname) ||
            !isEqual(locHistory, nextProps.locHistory) ||
            me !== nextProps.me ||
            nextState.height !== this.divElement.clientHeight ||
            (scrollTop < 52 && nextProps.scrollTop > 52) ||
            (scrollTop > 52 && nextProps.scrollTop < 52)
    }

    toggle = () => {
        const { dropdownOpen } = this.state;

        this.setState({
            dropdownOpen: !dropdownOpen
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
        const { show } = this.props;

        show('utilities', {
            activeTab
        })

        this.toggle()
    }

    render() {
        const { locHistory: { next, back }, push, me, logout, scrollTop, replace, className, query, children } = this.props
        const { height, dropdownOpen } = this.state;

        return (
            <div className={`header-wrapper ${className}` || ""} style={{ minHeight: height }}>
                <Sticky
                    className="stickymaker"
                    activeClassName="sticky sticky-3"
                    stickyWidth={`calc(100% - ${260}px)`}
                    isSticky={scrollTop - 52 > 0}
                >

                    <div className="navbar-wrapper" ref={(divElement) => this.divElement = divElement}>
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
                                <SearchBox ref={r => this.search = r} initialValue={query}
                                    handleSearch={(prev, searchQuery) => {
                                        if (prev) {
                                            replace(`/search/${searchQuery}`)
                                        } else {
                                            push(`/search/${searchQuery}`)
                                        }
                                    }} />
                            </div>

                            <div className="d-flex align-items-center justify-content-between">
                                <User me={me} />

                                <ButtonDropdown isOpen={dropdownOpen} toggle={this.toggle}
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

                                        <a href="https://github.com/Superjo149/auryo/" className="dropdown-item">
                                            Contribute
                                        </a>
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
                        <div>{children && children}</div>
                    </div>
                </Sticky>
            </div>
        )
    }
}

Header.propTypes = {
    children: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    locHistory: PropTypes.object.isRequired,
    className: PropTypes.string,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    me: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired,
    query: PropTypes.string,
    focus: PropTypes.bool
}

Header.defaultProps = {
    className: '',
    query: '',
    focus: false,
    children: null
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