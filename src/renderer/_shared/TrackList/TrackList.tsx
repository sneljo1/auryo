import { Normalized } from '@types';
import React from 'react';
import ReactList from 'react-list';
import { InfiniteScroll } from '../InfiniteScroll';
import Spinner from '../Spinner/Spinner';
import TrackListItem from './TrackListItem/TrackListItem';
import { PlaylistIdentifier } from '@common/store/types';

interface Props {
  items: Normalized.NormalizedResult[];
  id: PlaylistIdentifier;
  hideFirstTrack?: boolean;

  // Infinite loading
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?(): Promise<void>;
}

export const TrackList: React.SFC<Props> = ({
  items,
  id,
  hideFirstTrack,
  isLoading = false,
  loadMore,
  hasMore = false
}) => {
  function renderItem(index: number) {
    // using a spread because we don't want to unshift the original list
    const showedItems = [...items];

    if (hideFirstTrack) {
      showedItems.shift();
    }

    const item = showedItems[index];

    return <TrackListItem key={`track-list-${item.id}`} playlistId={id} idResult={item} />;
  }

  function renderWrapper(children: JSX.Element[], ref: string) {
    return (
      <table className="table table-borderless">
        <thead>
          <tr className="trackListHeader">
            <th className="row-play" />
            <th className="row-title">Title</th>
            <th className="trackArtist row-artist">Artist</th>
            <th className="text-xs-center row-timer">Time</th>
            <th className="trackitemActions row-actions" />
          </tr>
        </thead>
        <tbody ref={ref}>{children}</tbody>
      </table>
    );
  }

  const length = items.length - (hideFirstTrack ? 1 : 0);

  return (
    <div className="trackList">
      <InfiniteScroll key="trackList" hasMore={hasMore} isFetching={isLoading} loadMore={loadMore}>
        <ReactList
          pageSize={8}
          type="simple"
          itemsRenderer={renderWrapper}
          length={length}
          itemRenderer={renderItem as any}
          useTranslate3d
          threshold={400}
        />

        {isLoading && <Spinner />}
      </InfiniteScroll>
    </div>
  );
};
