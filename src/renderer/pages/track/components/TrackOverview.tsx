import { ObjectState } from '@common/store/objects';
import { abbreviateNumber } from '@common/utils';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Normalized, SoundCloud } from '../../../../types';
import { CommentList } from '../../../_shared/CommentList/CommentList';
import { Linkify } from '../../../_shared/Linkify';
import { ToggleMore } from '../../../_shared/ToggleMore';
import TrackGridUser from '../../../_shared/TracksGrid/TrackgridUser/TrackGridUser';

interface Props {
  track: Normalized.Track;
  comments: ObjectState<Normalized.NormalizedResult> | null;

  hasMore: boolean;
  loadMore(): Promise<void>;
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

export const TrackOverview = React.memo<Props>(({ track, comments, hasMore, loadMore }) => (
  <div className="row">
    <div className="col-12 col-lg-3">
      <div className="row">
        <div className="col-6 col-lg-12">
          <TrackGridUser idResult={{ id: track.user, schema: 'users' }} />
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
        <CommentList items={comments.items} isLoading={comments.isFetching} hasMore={hasMore} loadMore={loadMore} />
      )}
    </div>
  </div>
));
