import { EVENTS } from '@common/constants/events';
import { loadingErrorSelector, offlineSelector } from '@common/store/app/selectors';
import { themeSelector } from '@common/store/selectors';
import { Offline } from '@renderer/app/components/Offline/Offline';
import { ContentContextProvider } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import is from 'electron-is';
import React, { FC } from 'react';
import Theme from 'react-custom-properties';
import { useSelector } from 'react-redux';
import AppError from './components/AppError/AppError';
import AboutModal from './components/modals/AboutModal/AboutModal';
import ChangelogModal from './components/modals/ChangeLogModal/ChangelogModal';
import { Player } from './components/player/Player';
import SideBar from './components/Sidebar/Sidebar';
import { Themes } from './components/Theme/themes';
import { ContentWrapper } from './ContentWrapper';

export const Layout: FC = ({ children }) => {
  const theme = useSelector(themeSelector);
  const loadingError = useSelector(loadingErrorSelector);

  return (
    <Theme global properties={Themes[theme]}>
      <div
        className={cn('body auryo', {
          development: !(process.env.NODE_ENV === 'production'),
          mac: is.osx()
        })}>
        {loadingError ? (
          <AppError
            error={loadingError}
            reload={() => {
              ipcRenderer.send(EVENTS.APP.RELOAD);
            }}
          />
        ) : null}

        <main>
          <SideBar />

          <ContentContextProvider>
            <ContentWrapper>{children}</ContentWrapper>
          </ContentContextProvider>

          <Player />
        </main>

        {/* Register Modals */}

        <AboutModal />
        <ChangelogModal />
      </div>
    </Theme>
  );
};
