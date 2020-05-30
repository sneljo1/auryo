import * as actions from '@common/store/actions';
import { searchPlaylistFetchMore } from '@common/store/actions';
import { PlaylistTypes } from '@common/store/objects';
import { getPlaylistObjectSelector, getSearchQuery } from '@common/store/selectors';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

type Props = RouteComponentProps<{ playlistType?: PlaylistTypes }>;

export const SearchPage: FC<Props> = ({
  match: {
    params: { playlistType = PlaylistTypes.SEARCH }
  }
}) => {
  const dispatch = useDispatch();
  const playlistObject = useSelector(getPlaylistObjectSelector({ playlistType }));
  const query = useSelector(getSearchQuery);

  useEffect(() => {
    if (playlistType !== PlaylistTypes.SEARCH && playlistObject?.meta?.query !== query) {
      dispatch(
        actions.getSearchPlaylist({
          playlistType,
          refresh: true,
          query
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
      <div className="container-fluid charts">
        <div className="tabs nav nav-tabs">
          <NavLink exact className="nav-link" to="/search" activeClassName="active">
            All
          </NavLink>

          <NavLink className="nav-link" to={`/search/${PlaylistTypes.SEARCH_USER}`} activeClassName="active">
            Users
          </NavLink>
          <NavLink className="nav-link" to={`/search/${PlaylistTypes.SEARCH_TRACK}`} activeClassName="active">
            Tracks
          </NavLink>
          <NavLink className="nav-link" to={`/search/${PlaylistTypes.SEARCH_PLAYLIST}`} activeClassName="active">
            Playlist
          </NavLink>
        </div>
      </div>

      {!playlistObject || (!playlistObject?.items.length && playlistObject?.isFetching) ? (
        <Spinner contained />
      ) : (
        <>
          {!query || query === '' || (!playlistObject.items.length && !playlistObject.isFetching) ? (
            <div className="pt-5 mt-5">
              <h5 className="text-muted text-center">
                {query ? `No results for "${query}"` : 'Search for people, tracks and albums'}
              </h5>
              <div className="text-center" style={{ fontSize: '5rem' }}>
                {query ? '😭' : '🕵️‍'}
              </div>
            </div>
          ) : (
            <TracksGrid
              items={playlistObject.items}
              playlistID={{ playlistType }}
              isLoading={playlistObject.isFetching}
              isItemLoaded={index => !!playlistObject.items[index]}
              loadMore={loadMore}
              hasMore={!!playlistObject.nextUrl && !playlistObject.error && !playlistObject.isFetching}
            />
          )}
        </>
      )}
    </>
  );
};

export default SearchPage;
