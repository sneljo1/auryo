import { Icon, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actions from '../../../../../shared/actions/index';
import Sticky from '../../../_shared/Sticky';
import SearchBox from './Search/SearchBox';
import User from './User/AuthUser';

class Header extends React.Component {

    state = {
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
        const { scrollTop, location, locHistory, me, app: { update } } = this.props;

        return !isEqual(location.pathname, nextProps.location.pathname) ||
            !isEqual(locHistory, nextProps.locHistory) ||
            me !== nextProps.me ||
            nextState.height !== this.divElement.clientHeight ||
            nextProps.app.update !== update ||
            (scrollTop < 52 && nextProps.scrollTop > 52) ||
            (scrollTop > 52 && nextProps.scrollTop < 52)
    }

    toggle = () => {
        const { dropdownOpen } = this.state;

        this.setState({
            dropdownOpen: !dropdownOpen
        })
    }

    goBack = () => {
        const { locHistory: { back }, history } = this.props

        if (back) {
            history.goBack()
        }
    }

    goForward = () => {
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
        const { locHistory: { next, back }, push, me, logout, scrollTop, replace, className, query, children, app: { update }, doUpdate } = this.props
        const { height } = this.state;

        return (
            <div className={`header-wrapper ${className}`} style={{ minHeight: height }}>
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
                                    handleSearch={(prev, rawQuery) => {
                                        const searchQuery = escape(rawQuery.replace("%", ""))

                                        if (!searchQuery) {
                                            return replace("/search")
                                        }

                                        if (prev) {
                                            replace(`/search/${searchQuery}`)
                                        } else {
                                            push(`/search/${searchQuery}`)
                                        }
                                    }} />
                            </div>

                            <div className="d-flex align-items-center justify-content-between">
                                <User me={me} />

                                <Popover autoFocus={false} minimal content={(
                                    <Menu>

                                        <MenuItem text="About" icon="info-sign"
                                            onClick={this.showUtilitiesModal.bind(this, 'about')} />

                                        <MenuItem text="Settings" icon="cog"
                                            onClick={this.showUtilitiesModal.bind(this, 'settings')} />

                                        {
                                            update.available && (
                                                <MenuItem className="text-primary" text="Update" icon="box"
                                                    onClick={doUpdate} />
                                            )
                                        }

                                        <MenuDivider />

                                        <MenuItem text="Contribute" href="https://github.com/Superjo149/auryo/" />
                                        <MenuItem text="Report an issue" href="https://github.com/Superjo149/auryo/issues" />
                                        <MenuItem text="Suggest a feature" href="https://github.com/Superjo149/auryo/issues" />
                                        <MenuItem text="Donate" href="http://auryo.com/#donate" />

                                        <MenuDivider />

                                        <MenuItem text="Logout" icon="log-out"
                                            onClick={logout} />

                                    </Menu>
                                )} position={Position.BOTTOM_RIGHT}>
                                    <a href="javascript:void(0)" className="toggle">
                                        <Icon icon="more" />
                                        {
                                            update.available && (
                                                <sup data-show="true" title="5" />
                                            )
                                        }
                                    </a>
                                </Popover>
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
    app: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    locHistory: PropTypes.object.isRequired,
    className: PropTypes.string,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    me: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    doUpdate: PropTypes.func.isRequired,
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