import { PlaylistTypes } from '@common/store/objects';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import React from 'react';
import TrackGridItem from './TrackgridItem/TrackGridItem';
import TrackGridUser from './TrackgridUser/TrackGridUser';

interface Props {
  data: {
    itemsPerRow: number;
    items: any[];
    objectId: string;
    showInfo: boolean;
  };
  index: number;
  style: React.CSSProperties;
}

@autobind
export class TrackGridRow extends React.PureComponent<Props> {
  get itemWidth(): string {
    const {
      data: { itemsPerRow }
    } = this.props;

    return `${100 / itemsPerRow}%`;
  }

  private renderItem(index: number) {
    const {
      data: { showInfo, objectId, items }
    } = this.props;

    const item = items[index];

    if (item.schema === 'users') {
      return (
        <div
          key={`grid-item-${item.schema}-${item.id}`}
          className={cn('userWrapper')}
          style={{ width: this.itemWidth }}>
          <TrackGridUser withStats idResult={item} />
        </div>
      );
    }

    const showReposts = objectId === PlaylistTypes.STREAM;

    return (
      <div key={`grid-item-${item.schema}-${item.id}`} style={{ width: this.itemWidth }}>
        <TrackGridItem
          showReposts={showReposts}
          key={`grid-item-${item.schema}-${item.id}`}
          showInfo={showInfo}
          idResult={item}
          currentPlaylistId={objectId}
        />
      </div>
    );
  }

  public render() {
    const { data, index, style } = this.props;
    const { itemsPerRow, items } = data;

    const nodes = [];
    const fromIndex = index * itemsPerRow;
    const toIndex = Math.min(fromIndex + itemsPerRow, items.length);

    for (let i = fromIndex; i < toIndex; i += 1) {
      nodes.push(this.renderItem(i));
    }

    if (!nodes.length) {
      return null;
    }

    return (
      <div className="row m-0" style={style}>
        {nodes}
      </div>
    );
  }
}
