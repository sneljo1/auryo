import { IMAGE_SIZES } from '@common/constants';
import { playTrack, playTrackFromQueue, removeFromQueueOrUpNext, startPlayMusic } from '@common/store/actions';
import { getCurrentPlaylistId, getTrackEntity, isTrackLoading } from '@common/store/selectors';
import { ObjectStateItem, PlaylistTypes } from '@common/store/types';
import { SC } from '@common/utils';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ActionsDropdown } from '../../../_shared/ActionsDropdown';
import FallbackImage from '../../../_shared/FallbackImage';
import { TextShortener } from '../../../_shared/TextShortener';

interface Props {
  item: ObjectStateItem;
  played: boolean;
  playing: boolean;
  index: number;
}

export const QueueItem: FC<Props> = ({ playing, played, item, index }) => {
  const dispatch = useDispatch();
  const currentPlaylistId = useSelector(getCurrentPlaylistId);
  const trackLoading = useSelector(isTrackLoading(item.id));
  const track = useSelector(getTrackEntity(item.id));

  const removeFromQueue = useCallback(() => {
    if (playing) return;
    dispatch(removeFromQueueOrUpNext(index));
  }, [dispatch, index, playing]);

  if (!currentPlaylistId) {
    return null;
  }

  if (!track || !track.user || trackLoading) {
    return (
      <div className="track d-flex flex-nowrap align-items-center">
        <div className="image-wrap">
          <svg width="40" height="40">
            <rect width="40" height="40" style={{ fill: '#eeeeee' }} />
            Sorry, your browser does not support inline SVG.
          </svg>
        </div>
        <div className="item-info">
          <div className="title">
            <svg width="150" height="14">
              <rect width="150" height="14" style={{ fill: '#eeeeee' }} />
              Sorry, your browser does not support inline SVG.
            </svg>
          </div>
          <div className="stats">
            <svg width="50" height="14">
              <rect width="50" height="14" style={{ fill: '#eeeeee' }} />
              Sorry, your browser does not support inline SVG.
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="queueItem">
      <div
        role="button"
        tabIndex={0}
        className={cn('track d-flex flex-nowrap align-items-center', {
          played,
          playing
        })}
        onClick={(e) => {
          if ((e.target as any).className !== 'bx bx-dots-horizontal-rounded') {
            dispatch(stopForwarding(playTrackFromQueue({ idResult: item, index })));
          }
        }}>
        <div className="image-wrap">
          <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} width={35} height={35} />
        </div>
        <div className="item-info">
          <div className="title">
            <Link
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              to={`/track/${track.id}`}>
              <TextShortener text={track.title} clamp={1} />
            </Link>
          </div>
          <div className="stats">
            <Link
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              to={`/user/${track.user.id}`}>
              {track.user.username}
            </Link>
          </div>
        </div>
      </div>

      <ActionsDropdown trackOrPlaylist={track} removeFromQueue={!playing ? removeFromQueue : undefined} />
    </div>
  );
};
