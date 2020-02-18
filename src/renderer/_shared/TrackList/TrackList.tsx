import { Normalized } from '@types';
import React from 'react';
import ReactList from 'react-list';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Spinner from '../Spinner/Spinner';
import TrackListItem from './TrackListItem/TrackListItem';

interface Props {
  items: Normalized.NormalizedResult[];
  objectId: string;
  hideFirstTrack?: boolean;

  // Infinite loading
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?(): Promise<void>;
}

export const TrackList: React.SFC<Props> = ({ items, objectId, hideFirstTrack, isLoading, loadMore, hasMore }) => {
  useInfiniteScroll(isLoading, hasMore ? loadMore : undefined);

  function renderItem(index: number) {
    // using a spread because we don't want to unshift the original list
    const showedItems = [...items];

    if (hideFirstTrack) {
      showedItems.shift();
    }

    const item = showedItems[index];

    return <TrackListItem key={`track-list-${item.id}`} currentPlaylistId={objectId} idResult={item} />;
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
    </div>
  );
};
