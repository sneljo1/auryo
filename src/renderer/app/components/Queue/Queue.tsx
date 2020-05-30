import { Classes } from '@blueprintjs/core';
import {
  getPlayingTrack,
  getPlayingTrackIndex,
  getPlaylistsObjects,
  getQueuePlaylistSelector,
  getPlayerUpNext
} from '@common/store/selectors';
import { Normalized } from '@types';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import ReactList from 'react-list';
import { useSelector } from 'react-redux';
import './Queue.scss';
import QueueItem from './QueueItem';

export const Queue: FC = () => {
  const listRef = useRef<ReactList>(null);
  const currentIndex = useSelector(getPlayingTrackIndex);
  const playingTrack = useSelector(getPlayingTrack);
  const playlists = useSelector(getPlaylistsObjects);
  const queue = useSelector(getQueuePlaylistSelector);
  const upNext = useSelector(getPlayerUpNext);

  useEffect(() => {
    if (currentIndex != null && listRef) {
      listRef.current?.scrollTo(currentIndex);
      console.log('scrollTo', listRef.current);
    }
  }, [listRef, currentIndex, playingTrack]);

  const items = useMemo(() => {
    const queueItemsWithUpnext = [...queue.items];

    queueItemsWithUpnext.splice(currentIndex + 1, 0, ...upNext);

    return queueItemsWithUpnext;
  }, [currentIndex, queue, upNext]);

  const onScroll = () => {
    // const { updateQueue } = this.props;
    // if (this.list.current) {
    //   updateQueue(this.list.current.getVisibleRange());
    // }
  };

  const renderTrack = useCallback(
    (index: number, key: number | string) => {
      const item = items[index];

      return (
        <QueueItem
          key={key}
          index={index}
          trackData={item}
          played={index < currentIndex}
          playing={index === currentIndex}
        />
      );
    },
    [currentIndex, items]
  );

  return (
    <aside className="playQueue">
      <div className="playqueue-title d-flex align-items-center justify-content-between">
        <div>Play Queue</div>
        <div>
          {/* {upNext.length > 0 && (
            <a
              href="javascript:void(0)"
              className="clearQueue"
              onClick={() => {
                clearUpNext();
              }}>
              Clear
            </a>
          )} */}
          <a className={Classes.POPOVER_DISMISS}>
            <i className="bx bx-x" />
          </a>
        </div>
      </div>
      <div className="tracks">
        <Scrollbars
          // onScroll={this.updateQueueDebounced}
          renderTrackHorizontal={() => <div />}
          renderTrackVertical={props => <div {...props} className="track-vertical" />}
          renderThumbHorizontal={() => <div />}
          renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>
          <ReactList
            ref={listRef}
            pageSize={8}
            type="uniform"
            initialIndex={currentIndex}
            length={items.length}
            useTranslate3d
            itemRenderer={renderTrack}
          />
        </Scrollbars>
      </div>
    </aside>
  );
};
