import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { getNormalizedUser } from '@common/store/entities/selectors';
import { ObjectTypes, PlaylistTypes } from '@common/store/objects';
import {
  getArtistLikesPlaylistObject,
  getArtistTracksPlaylistObject,
  getPlaylistName
} from '@common/store/objects/selectors';
import { PlayerStatus } from '@common/store/player';
import { abbreviateNumber, SC } from '@common/utils';
import { IPC } from '@common/utils/ipc';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import { bindActionCreators, Dispatch } from 'redux';
import FallbackImage from '../../_shared/FallbackImage';
import { Linkify } from '../../_shared/Linkify';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import { ToggleMore } from '../../_shared/ToggleMore';
import { TrackList } from '../../_shared/TrackList/TrackList';
import './ArtistPage.scss';
import ArtistProfiles from './components/ArtistProfiles/ArtistProfiles';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const {
    auth,
    app: { dimensions },
    player: { currentPlaylistId, status }
  } = state;
  const {
    match: {
      params: { artistId }
    }
  } = props;

  const playlistId = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
  const isPlayerPlaylist = currentPlaylistId === playlistId;
  const isPlaylistPlaying = isPlayerPlaylist && status === PlayerStatus.PLAYING;

  return {
    dimensions,
    auth,
    isPlayerPlaylist,
    isPlaylistPlaying,
    user: getNormalizedUser(+artistId)(state),
    [PlaylistTypes.ARTIST_TRACKS]: getArtistTracksPlaylistObject(artistId)(state),
    [PlaylistTypes.ARTIST_LIKES]: getArtistLikesPlaylistObject(artistId)(state),
    artistIdParam: +artistId
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchArtistIfNeeded: actions.fetchArtistIfNeeded,
      toggleFollowing: actions.toggleFollowing,
      fetchMore: actions.fetchMore,
      canFetchMoreOf: actions.canFetchMoreOf,
      playTrack: actions.playTrack,
      toggleStatus: actions.toggleStatus
    },
    dispatch
  );

type OwnProps = RouteComponentProps<{ artistId: string }>;

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
  activeTab: TabTypes;
  small: boolean;
}

enum TabTypes {
  TRACKS = 'tracks',
  LIKES = 'likes',
  INFO = 'info'
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class ArtistPage extends React.Component<AllProps, State> {
  public state: State = {
    activeTab: TabTypes.TRACKS,
    small: false
  };

  public componentDidMount() {
    const { fetchArtistIfNeeded, artistIdParam } = this.props;

    fetchArtistIfNeeded(artistIdParam);
  }

  public componentDidUpdate(prevProps: AllProps) {
    const { fetchArtistIfNeeded, artistIdParam, dimensions } = this.props;
    const { activeTab, small } = this.state;

    if (artistIdParam !== prevProps.artistIdParam) {
      fetchArtistIfNeeded(artistIdParam);
    }

    if (small !== dimensions.width < 990) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        small: dimensions.width < 990
      });
    }

    if (dimensions.width > 768 && activeTab === TabTypes.INFO) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        activeTab: TabTypes.TRACKS
      });
    }
  }

  public toggle(tab: TabTypes) {
    const { activeTab } = this.state;

    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  public toggleFollow() {
    const { toggleFollowing, artistIdParam } = this.props;

    toggleFollowing(artistIdParam);
  }

  public renderPlaylist(type: PlaylistTypes) {
    const {
      match: {
        params: { artistId }
      },
      canFetchMoreOf,
      fetchMore
    } = this.props;

    const objectId = getPlaylistName(artistId, type);
    // eslint-disable-next-line react/destructuring-assignment
    const playlist = this.props[type];

    if (!playlist) {
      return <Spinner contained />;
    }

    return (
      <>
        <TrackList
          items={playlist.items}
          objectId={objectId}
          isLoading={playlist.isFetching}
          hasMore={canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any}
          loadMore={() => {
            return fetchMore(objectId, ObjectTypes.PLAYLISTS) as any;
          }}
        />
        {playlist.isFetching ? <Spinner /> : null}
      </>
    );
  }

  public renderPlayButton() {
    const {
      playTrack,
      isPlaylistPlaying,
      isPlayerPlaylist,
      toggleStatus,
      match: {
        params: { artistId }
      }
    } = this.props;

    const playlistId = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
    // eslint-disable-next-line react/destructuring-assignment
    const tracksPlaylists = this.props[PlaylistTypes.ARTIST_TRACKS];

    if (!tracksPlaylists || !tracksPlaylists.items.length) {
      return null;
    }

    const firstId = tracksPlaylists.items[0].id;

    if (isPlaylistPlaying) {
      return (
        <a
          href="javascript:void(0)"
          className="c_btn playing round colored"
          onClick={() => {
            toggleStatus();
          }}>
          <i className="bx bx-pause" />
        </a>
      );
    }

    const toggle = () => {
      if (isPlayerPlaylist) {
        toggleStatus();
      } else {
        playTrack(playlistId.toString(), { id: firstId });
      }
    };

    return (
      <a href="javascript:void(0)" className="c_btn round colored" onClick={toggle}>
        <i className="bx bx-play" />
      </a>
    );
  }

  public renderInfo(toggleMore = false) {
    const { user } = this.props;

    if (!user) {
      return null;
    }

    return (
      <>
        <ul className="artistStats d-flex">
          <li>
            <span>{abbreviateNumber(user.followers_count)}</span>
            <span>Followers</span>
          </li>
          <li>
            <span>{abbreviateNumber(user.followings_count)}</span>
            <span>Following</span>
          </li>
          <li>
            <span>{abbreviateNumber(user.track_count)}</span>
            <span>Tracks</span>
          </li>
        </ul>
        {toggleMore ? (
          <ToggleMore>
            <div className="artistInfo">
              <Linkify text={user.description} />
            </div>
          </ToggleMore>
        ) : (
          <div className="artistInfo p-1  pt-5">
            <Linkify text={user.description} />
          </div>
        )}

        <ArtistProfiles className="pt-1" profiles={user.profiles} />
      </>
    );
  }

  // tslint:disable-next-line: max-func-body-length
  public render() {
    const { user, artistIdParam, auth } = this.props;
    const { followings, me } = auth;
    const { small, activeTab } = this.state;

    if (!user || (user && user.loading) || user.track_count === null) {
      return <Spinner contained />;
    }

    const userImg = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.LARGE);
    const following = SC.hasID(user.id, followings);

    return (
      <>
        <SetLayoutSettings hasImage={!!userImg} />

        <PageHeader image={userImg}>
          <Row className="trackHeader">
            <Col xs="12" md="4" xl="3">
              <div className="imageWrapper">
                <FallbackImage src={userImg} />
              </div>
            </Col>

            <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
              <h2>{user.username}</h2>
              <h3 className="trackArtist">
                {user.city}
                {user.city && user.country ? ' , ' : null}
                {user.country}
              </h3>
              <div className="button-group">
                {this.renderPlayButton()}
                {me && artistIdParam !== me.id ? (
                  <a
                    href="javascript:void(0)"
                    className={cn('c_btn', { active: following })}
                    onClick={() => {
                      this.toggleFollow();
                    }}>
                    {following ? <i className="bx bx-check" /> : <i className="bx bx-plus" />}
                    <span>{following ? 'Following' : 'Follow'}</span>
                  </a>
                ) : null}

                <Popover
                  autoFocus={false}
                  minimal
                  position={Position.BOTTOM_LEFT}
                  content={
                    <Menu>
                      <MenuItem
                        text="View in browser"
                        onClick={() => {
                          IPC.openExternal(user.permalink_url);
                        }}
                      />
                      <ShareMenuItem username={user.username} permalink={user.permalink_url} />
                    </Menu>
                  }>
                  <a href="javascript:void(0)" className="c_btn round">
                    <i className="bx bx-dots-horizontal-rounded" />
                  </a>
                </Popover>
              </div>
            </Col>
          </Row>

          <div className="flex tracktabs row">
            <a
              href="javascript:void(0)"
              className={cn({ active: activeTab === TabTypes.TRACKS })}
              onClick={() => {
                this.toggle(TabTypes.TRACKS);
              }}>
              <span className="text">Tracks</span>
            </a>
            <a
              href="javascript:void(0)"
              className={cn({ active: activeTab === TabTypes.LIKES })}
              onClick={() => {
                this.toggle(TabTypes.LIKES);
              }}>
              <span className="text">Likes</span>
            </a>
            {small ? (
              <a
                href="javascript:void(0)"
                className={cn({ active: activeTab === TabTypes.INFO })}
                onClick={() => {
                  this.toggle(TabTypes.INFO);
                }}>
                <span className="text">Info</span>
              </a>
            ) : null}
          </div>
        </PageHeader>
        <div className="artistPage container-fluid detailPage">
          <Row className="main_track_content">
            <Col xs="12" lg="8">
              <TabContent activeTab={activeTab} className="px-1">
                {/* Tracks */}
                <TabPane tabId={TabTypes.TRACKS}>{this.renderPlaylist(PlaylistTypes.ARTIST_TRACKS)}</TabPane>

                {/* Likes */}
                <TabPane tabId={TabTypes.LIKES}>{this.renderPlaylist(PlaylistTypes.ARTIST_LIKES)}</TabPane>

                {/* Tab for info on smaller screens */}
                {small ? <TabPane tabId={TabTypes.INFO}>{this.renderInfo()}</TabPane> : null}
              </TabContent>
            </Col>
            {!small ? (
              <Col xs="4" className="artistSide">
                {this.renderInfo(true)}
              </Col>
            ) : null}
          </Row>
        </div>
      </>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArtistPage));
