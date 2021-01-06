import { genericPlaylistFetchMore, getGenericPlaylist } from '@common/store/actions';
import { getPlaylistObjectSelector } from '@common/store/selectors';
import { PlaylistIdentifier } from '@common/store/types';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import Spinner from '@renderer/_shared/Spinner/Spinner';
import { TrackList } from '@renderer/_shared/TrackList/TrackList';
import { stopForwarding } from 'electron-redux';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface Props {
  playlistID: PlaylistIdentifier;
}

export const PlaylistTrackList: FC<Props> = ({ playlistID }) => {
  const dispatch = useDispatch();
  const playlist = useSelector(getPlaylistObjectSelector(playlistID));

  useEffect(() => {
    dispatch(stopForwarding(getGenericPlaylist.request({ refresh: true, ...playlistID })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, playlistID]);

  const { loadMore } = useLoadMorePromise(
    playlist?.isFetching,
    () => {
      dispatch(stopForwarding(genericPlaylistFetchMore.request(playlistID)));
    },
    [dispatch, playlistID]
  );

  if (!playlist) {
    return <Spinner contained />;
  }

  return (
    <TrackList
      id={playlistID}
      items={playlist.items}
      hideFirstTrack
      isLoading={playlist.isFetching}
      hasMore={!!playlist.nextUrl && !playlist.error && !playlist.isFetching}
      loadMore={loadMore}
    />
  );
};
