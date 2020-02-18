import { Normalized } from '@types';
import cn from 'classnames';
import React, { SFC, useContext, useEffect, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { ContentContext } from '../context/contentContext';
import Spinner from '../Spinner/Spinner';
import { TrackGridRow } from './TrackGridRow';
import * as styles from './TracksGrid.module.scss';

interface Props {
  showInfo?: boolean;
  items: Normalized.NormalizedResult[];
  objectId: string;

  hasMore?: boolean;
  isLoading?: boolean;

  isItemLoaded?(index: number): boolean;
  loadMore?(startIndex: number, stopIndex: number): Promise<void>;
}

function getRowsForWidth(width: number): number {
  return Math.floor(width / 255);
}

const TracksGrid: SFC<Props> = props => {
  const { items, objectId, showInfo, isItemLoaded, loadMore, hasMore, isLoading } = props;
  const loaderRef = useRef<InfiniteLoader & { _listRef: List }>(null);
  const { setList } = useContext(ContentContext);
  const listRef = loaderRef?.current?._listRef;

  useEffect(() => {
    if (listRef) {
      setList(listRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef]);

  return (
    <div className={cn('songs container-fluid')}>
      <AutoSizer disableHeight>
        {({ width }: { width: number }) => {
          const itemsPerRow = getRowsForWidth(width);
          const rowCount = Math.ceil(items.length / itemsPerRow);

          // If there are more items to be loaded then add an extra row to hold a loading indicator.
          const itemCount = hasMore ? rowCount + 1 : rowCount;

          // Only load 1 page of items at a time.
          // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
          const loadMoreItems = isLoading || !hasMore ? () => Promise.resolve() : loadMore;

          return (
            <InfiniteLoader
              ref={loaderRef}
              isItemLoaded={(index: number) => {
                if (isItemLoaded) {
                  return isItemLoaded(index * itemsPerRow);
                }

                return true;
              }}
              threshold={50}
              itemCount={itemCount}
              loadMoreItems={(start, end) => {
                if (loadMoreItems && items.length - end * itemsPerRow < 5) {
                  return loadMoreItems(start, end);
                }

                return Promise.resolve();
              }}>
              {({ onItemsRendered, ref }: any) => (
                <>
                  <List
                    style={{ height: '100%', overflow: 'initial' }}
                    ref={ref}
                    height={window.innerHeight}
                    itemCount={itemCount}
                    onItemsRendered={onItemsRendered}
                    itemData={{
                      itemsPerRow,
                      items,
                      objectId,
                      showInfo
                    }}
                    itemSize={350}
                    width={width}>
                    {TrackGridRow}
                  </List>

                  {isLoading && (
                    <div className={styles.loadingWrapper} style={{ width: `${width}px` }}>
                      <Spinner />
                    </div>
                  )}
                </>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};

TracksGrid.defaultProps = {
  isItemLoaded: () => true,
  loadMore: () => Promise.resolve()
};

export default TracksGrid;
