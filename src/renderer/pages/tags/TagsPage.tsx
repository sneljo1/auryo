import * as actions from '@common/store/actions';
import { searchPlaylistFetchMore } from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { getPlaylistObjectSelector } from '@common/store/selectors';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

type Props = RouteComponentProps<{ tag: string }>;

export const TagsPage: FC<Props> = ({
  match: {
    params: { tag }
  }
}) => {
  const decodedTag = decodeURI(tag);
  const dispatch = useDispatch();
  const playlistObject = useSelector(getPlaylistObjectSelector({ playlistType: PlaylistTypes.SEARCH_TRACK }));

  useEffect(() => {
    if (playlistObject?.meta?.query !== decodedTag) {
      dispatch(
        actions.getSearchPlaylist({
          playlistType: PlaylistTypes.SEARCH_TRACK,
          refresh: true,
          tag: decodedTag
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { loadMore } = useLoadMorePromise(
    playlistObject?.isFetching,
    () => {
      dispatch(searchPlaylistFetchMore({ playlistType: PlaylistTypes.SEARCH_TRACK }));
    },
    [dispatch]
  );

  return (
    <>
      <PageHeader title={decodedTag} />

      {!playlistObject || (!playlistObject?.items.length && playlistObject?.isFetching) ? (
        <Spinner contained />
      ) : (
        <TracksGrid
          items={playlistObject.items}
          playlistID={{ playlistType: PlaylistTypes.SEARCH_TRACK }}
          isLoading={playlistObject.isFetching}
          isItemLoaded={(index) => !!playlistObject.items[index]}
          loadMore={loadMore}
          hasMore={!!playlistObject.nextUrl && !playlistObject.error && !playlistObject.isFetching}
        />
      )}
    </>
  );
};

export default TagsPage;
