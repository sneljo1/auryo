import { Icon, Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import { logout } from '@common/store/actions';
import { isUpdateAvailableSelector } from '@common/store/app/selectors';
import { currentUserSelector } from '@common/store/selectors';
import { useContentContext } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Sticky from 'react-sticky-el';
// import Sticky from 'react-stickynode';
import { show } from 'redux-modal';
import { HistoryNavigation } from './components/HistoryNavigation';
import { SearchBox } from './components/Search/SearchBox';
import User from './components/User/User';
import './Header.scss';

export const Header: FC = ({ children }) => {
  const { settings } = useContentContext();
  const currentUser = useSelector(currentUserSelector);
  const isUpdateAvailable = useSelector(isUpdateAvailableSelector);
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <div className={cn('header-wrapper', { withImage: settings.hasImage })}>
      <Sticky scrollElement="#scrollContainer">
        <div className="navbar-wrapper">
          <nav className="navbar justify-content-between">
            <div className="d-flex flex-nowrap align-items-center">
              <HistoryNavigation />
              <SearchBox />
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <User currentUser={currentUser} />

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
                        dispatch(
                          show('utilities', {
                            activeTab: 'about'
                          })
                        );
                      }}
                    />

                    <MenuItem
                      text="Settings"
                      icon="cog"
                      onClick={() => {
                        history.push('/settings');
                      }}
                    />

                    {isUpdateAvailable && (
                      <MenuItem
                        className="text-primary"
                        text="Update"
                        icon="box"
                        onClick={() => ipcRenderer.send(EVENTS.APP.UPDATE)}
                      />
                    )}

                    <MenuDivider />

                    <MenuItem text="Contribute" href="https://github.com/Superjo149/auryo/" />
                    <MenuItem text="Report an issue" href="https://github.com/Superjo149/auryo/issues" />
                    <MenuItem text="Suggest a feature" href="https://github.com/Superjo149/auryo/issues" />
                    <MenuItem text="Donate" href="https://github.com/sponsors/Superjo149" />

                    <MenuDivider />

                    <MenuItem text="Logout" icon="log-out" onClick={() => dispatch(logout())} />
                  </Menu>
                }>
                <a href="javascript:void(0)" className="toggle">
                  <Icon icon="more" />
                  {isUpdateAvailable && <sup data-show="true" title="5" />}
                </a>
              </Popover>
            </div>
          </nav>
          <div>{children}</div>
        </div>
      </Sticky>
    </div>
  );
};
