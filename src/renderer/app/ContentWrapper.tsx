import { Position } from '@blueprintjs/core';
// eslint-disable-next-line import/no-cycle
import { useContentContext } from '@renderer/_shared/context/contentContext';
import { debounce } from 'lodash';
import React, { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useHistory, useLocation } from 'react-router-dom';
import ErrorBoundary from '../_shared/ErrorBoundary';
import { Toastr } from './components/Toastr';

export const ContentWrapper: FC = ({ children }) => {
  const contentRef = useRef<Scrollbars>(null);
  const history = useHistory();
  const location = useLocation();
  const { list } = useContentContext();

  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollLocations, setScrollLocations] = useState({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (list?.current) {
        list?.current.scrollTo(scrollTop);
      }

      debouncedSetScrollPosition.current(scrollTop, location.pathname);
    },
    [list, location.pathname]
  );

  return (
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
  );
};
