import { PlaylistTypes } from '@common/store/objects';
import { PlaylistIdentifier } from '@common/store/playlist/types';
import cn from 'classnames';
import React, { FC, useCallback, useMemo } from 'react';
import { TrackGridItem } from './TrackgridItem/TrackGridItem';
import TrackGridUser from './TrackgridUser/TrackGridUser';

interface Props {
  data: {
    itemsPerRow: number;
    items: any[];
    showInfo: boolean;
    playlistID: PlaylistIdentifier;
  };
  index: number;
  style: React.CSSProperties;
}

export const TrackGridRow: FC<Props> = ({ data, index, style }) => {
  const { itemsPerRow, items, showInfo, playlistID } = data;

  const itemWidth = `${100 / itemsPerRow}%`;

  const renderItem = useCallback(
    (itemIndex: number) => {
      const item = items[itemIndex];

      if (item.schema === 'users') {
        return (
          <div key={`grid-item-${item.schema}-${item.id}`} className={cn('userWrapper')} style={{ width: itemWidth }}>
            <TrackGridUser withStats userId={item.id} />
          </div>
        );
      }

      const showReposts = playlistID.playlistType === PlaylistTypes.STREAM;

      return (
        <div key={`grid-item-${item.schema}-${item.id}`} style={{ width: itemWidth }}>
          <TrackGridItem
            showReposts={showReposts}
            key={`grid-item-${item.schema}-${item.id}`}
            showInfo={showInfo}
            idResult={item}
            playlistID={playlistID}
          />
        </div>
      );
    },
    [itemWidth, items, playlistID, showInfo]
  );

  const nodes = useMemo(() => {
    const itemsInRow = [];
    const fromIndex = index * itemsPerRow;
    const toIndex = Math.min(fromIndex + itemsPerRow, items.length);

    for (let i = fromIndex; i < toIndex; i += 1) {
      itemsInRow.push(renderItem(i));
    }

    return itemsInRow;
  }, [index, items.length, itemsPerRow, renderItem]);

  if (!nodes.length) {
    return null;
  }

  return (
    <div className="row m-0" style={style}>
      {nodes}
    </div>
  );
};
