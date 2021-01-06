import { Classes } from '@blueprintjs/core';
import { clearUpNext, genericPlaylistFetchMore } from '@common/store/actions';
import {
  getUpNextSelector,
  getPlayingTrackSelector,
  getPlayingTrackIndex,
  getQueuePlaylistSelector,
  getPlaylistsObjects
} from '@common/store/selectors';
import { PlaylistIdentifier, PlaylistTypes } from '@common/store/types';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import Spinner from '@renderer/_shared/Spinner/Spinner';
import { stopForwarding } from 'electron-redux';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import ReactList from 'react-list';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'react-use';
import './Queue.scss';
import { QueueItem } from './QueueItem';

export const Queue: FC = () => {
  const listRef = useRef<ReactList>(null);
  const currentIndex = useSelector(getPlayingTrackIndex);
  const playingTrack = useSelector(getPlayingTrackSelector);
  const queue = useSelector(getQueuePlaylistSelector);
  const playlists = useSelector(getPlaylistsObjects);
  const upNext = useSelector(getUpNextSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentIndex != null && listRef.current) {
      const visibleRanges = listRef.current.getVisibleRange();

      if (currentIndex < visibleRanges[0] || currentIndex > visibleRanges[1]) {
        listRef.current.scrollTo(currentIndex);
      }
    }
  }, [listRef, currentIndex, playingTrack]);

  const items = useMemo(() => {
    const queueItemsWithUpnext = [...queue.items];

    queueItemsWithUpnext.splice(currentIndex + 1, 0, ...upNext);

    return queueItemsWithUpnext;
  }, [currentIndex, queue, upNext]);

  const { loadMore } = useLoadMorePromise(
    queue?.isFetching,
    () => {
      if (!listRef.current) return;

      // Check and fetch remaining tracks from subplaylist when scrolled to in Queue
      const visibleRanges = listRef.current.getVisibleRange();
      const length = visibleRanges[1] + 10 - visibleRanges[0];

      const playlistIDsToFetch = Array.from(Array(length).keys()).reduce<PlaylistIdentifier[]>(
        (playlistsToFetch, _, index) => {
          const itemIndex = visibleRanges[0] + index;
          const item = items[itemIndex];

          if (item?.parentPlaylistID?.playlistType === PlaylistTypes.PLAYLIST && item.parentPlaylistID.objectId) {
            const playlist = playlists[item.parentPlaylistID.objectId];
            if (
              !playlist.isFetching &&
              !!playlist.itemsToFetch.length &&
              !playlistsToFetch.find(p => p.objectId === item.parentPlaylistID?.objectId)
            ) {
              playlistsToFetch.push(item.parentPlaylistID);
            }
          }

          return playlistsToFetch;
        },
        []
      );

      playlistIDsToFetch.forEach(playlistID => {
        dispatch(stopForwarding(genericPlaylistFetchMore.request(playlistID)));
      });

      // Fetch more items from Queue when almost out of tracks
      if (items.length - 10 < visibleRanges[0]) {
        dispatch(stopForwarding(genericPlaylistFetchMore.request({ playlistType: PlaylistTypes.QUEUE })));
      }
    },
    [dispatch]
  );

  const loadMoreDebounced = useRef(debounce(loadMore, 200, { maxWait: 300 }));

  const renderTrack = useCallback(
    (index: number, key: number | string) => {
      const item = items[index];

      return (
        <QueueItem key={key} index={index} item={item} played={index < currentIndex} playing={index === currentIndex} />
      );
    },
    [currentIndex, items]
  );

  return (
    <aside className="playQueue">
      <div className="playqueue-title d-flex align-items-center justify-content-between">
        <div>Play Queue</div>
        <div>
          {upNext.length > 0 && (
            <a
              href="javascript:void(0)"
              className="clearQueue"
              onClick={() => {
                dispatch(clearUpNext());
              }}>
              Clear
            </a>
          )}
          <a className={Classes.POPOVER_DISMISS}>
            <i className="bx bx-x" />
          </a>
        </div>
      </div>
      <div className="tracks">
        <Scrollbars
          onScroll={loadMoreDebounced.current}
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
          {queue?.isFetching && <Spinner />}
        </Scrollbars>
      </div>
    </aside>
  );
};
