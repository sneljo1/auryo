import { commentsFetchMore, getComments } from '@common/store/actions';
import { getCommentObject } from '@common/store/selectors';
import { abbreviateNumber } from '@common/utils';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Normalized, SoundCloud } from '../../../../types';
import { CommentList } from '../../../_shared/CommentList/CommentList';
import { Linkify } from '../../../_shared/Linkify';
import { ToggleMore } from '../../../_shared/ToggleMore';
import TrackGridUser from '../../../_shared/TracksGrid/TrackgridUser/TrackGridUser';

interface Props {
  track: Normalized.Track;
}

const getTags = (track: SoundCloud.Track | Normalized.Track) => {
  if (!track.tag_list) {
    return [];
  }

  return track.tag_list.split(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g).reduce((all: string[], obj: string) => {
    if (obj && obj !== '"') {
      all.push(obj.replace(/"/g, ''));
    }

    return all;
  }, []);
};

export const TrackOverview = React.memo<Props>(({ track }) => {
  const dispatch = useDispatch();
  const comments = useSelector(getCommentObject(track?.id));

  useEffect(() => {
    dispatch(getComments.request({ refresh: true, trackId: track?.id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, track?.id]);

  const { loadMore } = useLoadMorePromise(
    comments?.isFetching,
    () => {
      dispatch(commentsFetchMore.request({ trackId: track?.id }));
    },
    [dispatch, track?.id]
  );

  return (
    <div className="row">
      <div className="col-12 col-lg-3">
        <div className="row">
          <div className="col-6 col-lg-12">
            <TrackGridUser userId={track.user} />
          </div>

          <div className="col-6 col-lg-12">
            <div className="p-3 track-info">
              <strong>Created</strong>
              <div>{moment(new Date(track.created_at)).fromNow()}</div>

              {track.label_name && (
                <>
                  <strong>Label</strong>
                  <div>{track.label_name}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="trackPadding col-12 col-lg">
        <div className="flex stats align-items-center justify-content-between">
          <div className="taglist">
            {getTags(track).map(tag => (
              <Link key={tag} to={`/tags/${tag.replace('#', '')}`}>
                <span className="badge badge-secondary">{tag}</span>
              </Link>
            ))}
          </div>
          <div className="d-flex align-items-center">
            <i className="bx bxs-heart" />

            <span>{abbreviateNumber(track.likes_count)}</span>

            <i className="bx bx-play" />
            <span>{abbreviateNumber(track.playback_count)}</span>

            <i className="bx bx-repost" />
            <span>{abbreviateNumber(track.reposts_count)}</span>
          </div>
        </div>

        {track.description && (
          <ToggleMore className="trackDescription">
            <Linkify text={track.description} />
          </ToggleMore>
        )}

        {comments && (
          <CommentList
            items={comments.items}
            isLoading={comments.isFetching}
            hasMore={!!comments.nextUrl && !comments.error && !comments.isFetching}
            loadMore={loadMore}
          />
        )}
      </div>
    </div>
  );
});
