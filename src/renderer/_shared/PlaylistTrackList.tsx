import { genericPlaylistFetchMore, getGenericPlaylist } from '@common/store/actions';
import { getPlaylistObjectSelector } from '@common/store/selectors';
import { PlaylistIdentifier } from '@common/store/types';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import Spinner from '@renderer/_shared/Spinner/Spinner';
import { TrackList } from '@renderer/_shared/TrackList/TrackList';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface Props {
  id: PlaylistIdentifier;
}

export const PlaylistTrackList: FC<Props> = ({ id }) => {
  const dispatch = useDispatch();
  const playlist = useSelector(getPlaylistObjectSelector(id));

  useEffect(() => {
    dispatch(getGenericPlaylist.request({ refresh: true, ...id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const { loadMore } = useLoadMorePromise(
    playlist?.isFetching,
    () => {
      dispatch(genericPlaylistFetchMore.request(id));
    },
    [dispatch, id]
  );

  if (!playlist) {
    return <Spinner contained />;
  }

  return (
    <TrackList
      id={id}
      items={playlist.items}
      hideFirstTrack
      isLoading={playlist.isFetching}
      hasMore={!!playlist.nextUrl && !playlist.error && !playlist.isFetching}
      loadMore={loadMore}
    />
  );
};
