import { PlaylistIdentifier } from '@common/store/playlist/types';
import { Normalized } from '@types';
import cn from 'classnames';
import React, { FC, useEffect, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useContentContext } from '../context/contentContext';
import Spinner from '../Spinner/Spinner';
import { TrackGridRow } from './TrackGridRow';
import styles from './TracksGrid.module.scss';

interface Props {
  playlistID: PlaylistIdentifier;
  showInfo?: boolean;
  items: Normalized.NormalizedResult[];

  hasMore?: boolean;
  isLoading?: boolean;

  isItemLoaded?(index: number): boolean;
  loadMore?(startIndex: number, stopIndex: number): Promise<void>;
}

function getRowsForWidth(width: number): number {
  return Math.floor(width / 255);
}

const TracksGrid: FC<Props> = (props) => {
  const { items, showInfo, isItemLoaded, loadMore, hasMore, isLoading, playlistID } = props;
  const loaderRef = useRef<InfiniteLoader & { _listRef: List }>(null);
  const { list } = useContentContext();

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
              threshold={2}
              minimumBatchSize={2}
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
                    ref={list as any}
                    height={window.innerHeight}
                    itemCount={itemCount}
                    onItemsRendered={onItemsRendered}
                    itemData={{
                      itemsPerRow,
                      items,
                      showInfo,
                      playlistID
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
