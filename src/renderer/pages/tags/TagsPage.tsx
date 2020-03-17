import * as actions from '@common/store/actions';
import { searchPlaylistFetchMore } from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { getPlaylistObjectSelector } from '@common/store/objects/selectors';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import cn from 'classnames';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { Nav } from 'reactstrap';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

type Props = RouteComponentProps<{ tag: string; playlistType: PlaylistTypes }>;

export const TagsPage: FC<Props> = ({
  match: {
    params: { tag, playlistType = PlaylistTypes.SEARCH_TRACK }
  }
}) => {
  const dispatch = useDispatch();
  const playlistObject = useSelector(getPlaylistObjectSelector({ playlistType }));

  useEffect(() => {
    if (playlistType !== PlaylistTypes.SEARCH && playlistObject?.meta?.query !== tag) {
      dispatch(
        actions.getSearchPlaylist({
          playlistType,
          refresh: true,
          tag
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistType]);

  const { loadMore } = useLoadMorePromise(
    playlistObject?.isFetching,
    () => {
      dispatch(searchPlaylistFetchMore({ playlistType }));
    },
    [dispatch, playlistType]
  );

  return (
    <>
      <PageHeader title={tag} subtitle="Most popular" />

      <div className="container-fluid charts">
        <Nav className="tabs" tabs>
          <NavLink
            className={cn('nav-link', { active: playlistType === PlaylistTypes.SEARCH_TRACK })}
            to={`/tags/${tag}/${PlaylistTypes.SEARCH_TRACK}`}
            activeClassName="active">
            Tracks
          </NavLink>

          <NavLink
            className={cn('nav-link', { active: playlistType === PlaylistTypes.SEARCH_PLAYLIST })}
            activeClassName="active"
            to={`/tags/${tag}/${PlaylistTypes.SEARCH_PLAYLIST}`}>
            Playlists
          </NavLink>
        </Nav>
      </div>

      {!playlistObject || (!playlistObject?.items.length && playlistObject?.isFetching) ? (
        <Spinner contained />
      ) : (
        <TracksGrid
          items={playlistObject.items}
          playlistType={playlistType}
          isLoading={playlistObject.isFetching}
          isItemLoaded={index => !!playlistObject.items[index]}
          loadMore={loadMore}
          hasMore={!!playlistObject.nextUrl && !playlistObject.error && !playlistObject.isFetching}
        />
      )}
    </>
  );
};

export default TagsPage;
