import { Icon, Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { InjectedContentContextProps, withContentContext } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
import * as ReactRouter from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { isEqual } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import Sticky from 'react-stickynode';
import { bindActionCreators, compose, Dispatch } from 'redux';
import * as ReduxModal from 'redux-modal';
import './Header.scss';
import SearchBox from './Search/SearchBox';
import User from './User/User';
import { autobind } from 'core-decorators';

const mapStateToProps = ({ app, auth }: StoreState) => ({
  update: app.update,
  me: auth.me,
  locHistory: app.history
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      logout: actions.logout,
      show: ReduxModal.show,
      push: ReactRouter.push,
      replace: ReactRouter.replace
    },
    dispatch
  );

interface OwnProps {
  children?: React.ReactNode;
  className?: string;
  scrollTop: number;
  query?: string;
  focus?: boolean;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
  height: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch & RouteComponentProps & InjectedContentContextProps;

@autobind
class Header extends React.Component<AllProps, State> {
  public readonly state: State = {
    height: 0
  };

  private navBarWrapper = React.createRef<HTMLDivElement>();
  private search = React.createRef<SearchBox>();
  public static readonly defaultProps: Partial<AllProps> = {
    className: '',
    query: '',
    focus: false,
    children: null
  };

  public componentDidMount() {
    const { focus } = this.props;

    if (this.navBarWrapper.current) {
      this.setState({
        height: this.navBarWrapper.current.clientHeight
      });
    }

    if (focus && this.search.current) {
      this.search.current.focus();
    }
  }

  public shouldComponentUpdate(nextProps: AllProps, nextState: State) {
    const { scrollTop, locHistory, me, update, location, settings } = this.props;

    return (
      !isEqual(locHistory, nextProps.locHistory) ||
      !isEqual(location.pathname, nextProps.location.pathname) ||
      !isEqual(settings, nextProps.settings) ||
      me !== nextProps.me ||
      (this.navBarWrapper.current && nextState.height !== this.navBarWrapper.current.clientHeight) ||
      nextProps.update !== update ||
      scrollTop !== nextProps.scrollTop
    );
  }

  public componentDidUpdate(prevProps: AllProps) {
    const { height } = this.state;
    const { location } = this.props;

    if (this.navBarWrapper.current && height !== this.navBarWrapper.current.clientHeight) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        height: this.navBarWrapper.current.clientHeight
      });
    }

    if (location.pathname !== prevProps.location.pathname) {
      if (this.navBarWrapper.current) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          height: this.navBarWrapper.current.clientHeight
        });
      }
    }
  }

  public goBack() {
    const {
      locHistory: { back },
      history
    } = this.props;

    if (back) {
      history.goBack();
    }
  }

  public goForward() {
    const {
      locHistory: { next },
      history
    } = this.props;

    if (next) {
      history.goForward();
    }
  }

  public showUtilitiesModal(activeTab: string) {
    const { show } = this.props;

    show('utilities', {
      activeTab
    });
  }

  public doUpdate() {
    ipcRenderer.send(EVENTS.APP.UPDATE);
  }

  public handleSearch(prev: string, rawQuery?: string) {
    const { push, replace } = this.props;

    if (!rawQuery) {
      replace('/search');

      return;
    }

    const searchQuery = rawQuery;

    if (prev) {
      replace({
        pathname: `/search`,
        search: searchQuery
      });
    } else {
      push({
        pathname: `/search`,
        search: searchQuery
      });
    }
  }

  // tslint:disable-next-line: max-func-body-length
  public render() {
    const {
      locHistory: { next, back },
      me,
      logout,
      scrollTop,
      settings,
      query,
      children,
      update,
      push
    } = this.props;

    const { height } = this.state;

    const isSticky = scrollTop - 52 > 0;

    return (
      <div className={cn('header-wrapper', { withImage: settings.hasImage })} style={{ minHeight: height }}>
        <Sticky activeClass="sticky sticky-3" enabled={isSticky}>
          <div className="navbar-wrapper" ref={this.navBarWrapper}>
            <nav className="navbar justify-content-between">
              <div className="d-flex flex-nowrap align-items-center">
                <div className="control-nav">
                  <div className="control-nav-inner flex">
                    <a className={cn({ disabled: !back })} href="javascript:void(0)" onClick={this.goBack}>
                      <i className="bx bx-chevron-left" />
                    </a>
                    <a className={cn({ disabled: !next })} href="javascript:void(0)" onClick={this.goForward}>
                      <i className="bx bx-chevron-right" />
                    </a>
                  </div>
                </div>

                <SearchBox ref={this.search} initialValue={query} handleSearch={this.handleSearch} />
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <User me={me} />

                <Popover
                  position={Position.BOTTOM_RIGHT}
                  autoFocus={false}
                  minimal
                  content={
                    <Menu>
                      <MenuItem
                        text="About"
                        icon="info-sign"
                        onClick={() => {
                          this.showUtilitiesModal('about');
                        }}
                      />

                      <MenuItem
                        text="Settings"
                        icon="cog"
                        onClick={() => {
                          push('/settings');
                        }}
                      />

                      {update.available && (
                        <MenuItem className="text-primary" text="Update" icon="box" onClick={this.doUpdate} />
                      )}

                      <MenuDivider />

                      <MenuItem text="Contribute" href="https://github.com/Superjo149/auryo/" />
                      <MenuItem text="Report an issue" href="https://github.com/Superjo149/auryo/issues" />
                      <MenuItem text="Suggest a feature" href="https://github.com/Superjo149/auryo/issues" />
                      <MenuItem text="Donate" href="https://github.com/sponsors/Superjo149" />

                      <MenuDivider />

                      <MenuItem text="Logout" icon="log-out" onClick={logout} />
                    </Menu>
                  }>
                  <a href="javascript:void(0)" className="toggle">
                    <Icon icon="more" />
                    {update.available && <sup data-show="true" title="5" />}
                  </a>
                </Popover>
              </div>
            </nav>
            <div>{children && children}</div>
          </div>
        </Sticky>
      </div>
    );
  }
}

export default compose(
  connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps),
  withRouter,
  withContentContext
)(Header);
