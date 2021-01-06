import { Position } from '@blueprintjs/core';
// eslint-disable-next-line import/no-cycle
import { ContentContext, INITIAL_LAYOUT_SETTINGS } from '@renderer/_shared/context/contentContext';
import { debounce } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useHistory, useLocation } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import ErrorBoundary from '../_shared/ErrorBoundary';
import { Toastr } from './components/Toastr';

export const ContentWrapper: FC = ({ children }) => {
  const contentRef = useRef<Scrollbars>(null);
  const history = useHistory();
  const location = useLocation();

  const [settings, setSettings] = useState(INITIAL_LAYOUT_SETTINGS);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollLocations, setScrollLocations] = useState({});
  const [list, setList] = useState<FixedSizeList | null>(null);

  // If we go back and know the scrollLocation of the previous page, scroll to it
  useLayoutEffect(() => {
    const unregister = history.listen((_location, action) => {
      const previousScrollTop = scrollLocations[_location.pathname] || 0;

      if (!isScrolling) {
        const scrollTo = action === 'POP' ? previousScrollTop : 0;

        setIsScrolling(true);

        requestAnimationFrame(() => {
          // Scroll content to correct place
          contentRef.current?.scrollTop(scrollTo);

          setIsScrolling(false);
        });
      }
    });

    return () => unregister();
  }, [history, isScrolling, scrollLocations]);

  const debouncedSetScrollPosition = useRef(
    debounce(
      (scrollTop: number, pathname: string) => {
        setScrollLocations(scrollLocations => ({
          ...scrollLocations,
          [pathname]: scrollTop
        }));
      },
      100,
      { maxWait: 200 }
    )
  );

  const handleScroll = useCallback(
    (e: React.ChangeEvent<HTMLDivElement>) => {
      const { scrollTop } = e.target;

      if (list) {
        list.scrollTo(scrollTop);
      }

      debouncedSetScrollPosition.current(scrollTop, location.pathname);
    },
    [list, location.pathname]
  );

  return (
    <ContentContext.Provider
      value={{
        settings,
        list,
        setList: newList => setList(newList),
        applySettings: newSettings => setSettings(oldSettings => ({ ...oldSettings, ...newSettings }))
      }}>
      <Scrollbars
        className="content"
        ref={contentRef}
        onScroll={handleScroll as any}
        renderView={props => <div id="scrollContainer" {...props} />}
        renderTrackHorizontal={() => <div />}
        renderTrackVertical={props => <div {...props} className="track-vertical" />}
        renderThumbHorizontal={() => <div />}
        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>
        <Toastr position={Position.TOP_RIGHT} />

        <ErrorBoundary>{children}</ErrorBoundary>
      </Scrollbars>
    </ContentContext.Provider>
  );
};
