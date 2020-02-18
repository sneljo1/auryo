import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { ObjectTypes, PlaylistTypes } from '@common/store/objects';
import { getPlaylistName, getPlaylistObjectSelector } from '@common/store/objects/selectors';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';
import { autobind } from 'core-decorators';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const {
    match: {
      params: { category }
    },
    location: { search: rawSearch }
  } = props;

  const query: string = decodeURI(rawSearch.replace('?', ''));

  let objectId: string;

  switch (category) {
    case 'user':
      objectId = getPlaylistName(query, PlaylistTypes.SEARCH_USER);
      break;
    case 'playlist':
      objectId = getPlaylistName(query, PlaylistTypes.SEARCH_PLAYLIST);
      break;
    case 'track':
      objectId = getPlaylistName(query, PlaylistTypes.SEARCH_TRACK);
      break;
    default:
      objectId = getPlaylistName(query, PlaylistTypes.SEARCH);
  }

  return {
    query,
    playlist: getPlaylistObjectSelector(objectId)(state),
    objectId
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      search: actions.search,
      canFetchMoreOf: actions.canFetchMoreOf,
      fetchMore: actions.fetchMore,
      toggleFollowing: actions.toggleFollowing,
      playTrack: actions.playTrack
    },
    dispatch
  );

type OwnProps = RouteComponentProps<{ category?: string }>;

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class Search extends React.Component<AllProps> {
  public componentDidMount() {
    const { query, search, playlist, objectId } = this.props;

    if (!playlist && query && query.length) {
      search({ query }, objectId, 15);
    }
  }

  public componentDidUpdate(prevProps: AllProps) {
    const { query, search, playlist, objectId } = this.props;

    if ((query !== prevProps.query || !playlist) && query && query.length) {
      search({ query }, objectId, 15);
    }
  }

  public render() {
    const { playlist, objectId, query, canFetchMoreOf, fetchMore } = this.props;

    if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
      return <Spinner contained />;
    }

    return (
      <>
        <div className="container-fluid charts">
          <div className="tabs nav nav-tabs">
            <NavLink exact className="nav-link" to={{ pathname: `/search`, search: query }} activeClassName="active">
              All
            </NavLink>

            <NavLink className="nav-link" to={{ pathname: `/search/user`, search: query }} activeClassName="active">
              Users
            </NavLink>
            <NavLink className="nav-link" to={{ pathname: `/search/track`, search: query }} activeClassName="active">
              Tracks
            </NavLink>
            <NavLink className="nav-link" to={{ pathname: `/search/playlist`, search: query }} activeClassName="active">
              Playlist
            </NavLink>
          </div>
        </div>

        {query === '' || (playlist && !playlist.items.length && !playlist.isFetching) ? (
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
            items={playlist.items}
            objectId={objectId}
            isLoading={playlist.isFetching}
            isItemLoaded={index => !!playlist.items[index]}
            loadMore={() => {
              return fetchMore(objectId, ObjectTypes.PLAYLISTS) as any;
            }}
            hasMore={canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any}
          />
        )}
      </>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(Search);
