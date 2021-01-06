import { IResizeEntry, ResizeSensor } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import * as actions from '@common/store/actions';
import { loadingErrorSelector } from '@common/store/app/selectors';
import { themeSelector } from '@common/store/selectors';
import cn from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import is from 'electron-is';
import React, { FC, useCallback } from 'react';
import Theme from 'react-custom-properties';
import { useDispatch, useSelector } from 'react-redux';
import { AudioPlayerProvider } from '../hooks/useAudioPlayer';
import AppError from './components/AppError/AppError';
import AboutModal from './components/modals/AboutModal/AboutModal';
import ChangelogModal from './components/modals/ChangeLogModal/ChangelogModal';
import { Player } from './components/player/Player';
import SideBar from './components/Sidebar/Sidebar';
import { Themes } from './components/Theme/themes';
import { ContentWrapper } from './ContentWrapper';

export const Layout: FC = ({ children }) => {
  const dispatch = useDispatch();

  const theme = useSelector(themeSelector);
  const loadingError = useSelector(loadingErrorSelector);

  // TODO: can this be removed?
  const onResize = useCallback(
    ([
      {
        contentRect: { width, height }
      }
    ]: IResizeEntry[]) => {
      // dispatch(
      //   actions.setDebouncedDimensions({
      //     height,
      //     width
      //   })
      // );
    },
    [dispatch]
  );

  return (
    <ResizeSensor onResize={onResize}>
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

            <ContentWrapper>{children}</ContentWrapper>

            <AudioPlayerProvider>
              <Player />
            </AudioPlayerProvider>
          </main>

          {/* Register Modals */}

          <AboutModal />
          <ChangelogModal />
        </div>
      </Theme>
    </ResizeSensor>
  );
};
