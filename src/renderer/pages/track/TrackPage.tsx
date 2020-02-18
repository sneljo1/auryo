import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { getUserPlaylistsCombined } from '@common/store/auth/selectors';
import { getNormalizedTrack, getNormalizedUser } from '@common/store/entities/selectors';
import { ObjectTypes, PlaylistTypes } from '@common/store/objects';
import { getCommentObject, getPlaylistName, getRelatedTracksPlaylistObject } from '@common/store/objects/selectors';
import { PlayerStatus } from '@common/store/player';
import { togglePlaylistTrack } from '@common/store/playlist/actions';
import { SC } from '@common/utils';
import { IPC } from '@common/utils/ipc';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import { bindActionCreators, Dispatch } from 'redux';
import FallbackImage from '../../_shared/FallbackImage';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import TogglePlayButton from '../../_shared/TogglePlayButton';
import { TrackList } from '../../_shared/TrackList/TrackList';
import { TrackOverview } from './components/TrackOverview';
import './TrackPage.scss';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const { songId } = props.match.params;
  const {
    player: { playingTrack, currentPlaylistId, status },
    auth
  } = state;

  const relatedPlaylistId = getPlaylistName(songId, PlaylistTypes.RELATED);

  const track = getNormalizedTrack(+songId)(state);
  const user = getNormalizedUser(track.user)(state);

  return {
    playingTrack,
    isRelatedPlaylistsPlaying: currentPlaylistId === relatedPlaylistId && status === PlayerStatus.PLAYING,
    relatedPlaylistId,
    auth,
    track,
    user,
    userPlaylists: getUserPlaylistsCombined(state),
    songIdParam: +songId,
    relatedTracks: getRelatedTracksPlaylistObject(songId)(state),
    comments: getCommentObject(songId)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchTrackIfNeeded: actions.fetchTrackIfNeeded,
      toggleRepost: actions.toggleRepost,
      fetchMore: actions.fetchMore,
      canFetchMoreOf: actions.canFetchMoreOf,
      playTrack: actions.playTrack,
      toggleFollowing: actions.toggleFollowing,
      addUpNext: actions.addUpNext,
      toggleLike: actions.toggleLike,
      togglePlaylistTrack
    },
    dispatch
  );

type OwnProps = RouteComponentProps<{ songId: string }>;

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
  activeTab: TabTypes;
}

enum TabTypes {
  OVERVIEW = 'overview',
  RELATED_TRACKS = 'related'
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class TrackPage extends React.PureComponent<AllProps, State> {
  public readonly state: State = {
    activeTab: TabTypes.OVERVIEW
  };

  public componentDidMount() {
    const { fetchTrackIfNeeded, songIdParam } = this.props;

    fetchTrackIfNeeded(songIdParam);
  }

  public componentDidUpdate() {
    const { fetchTrackIfNeeded, songIdParam } = this.props;

    fetchTrackIfNeeded(songIdParam);
  }

  public toggle(tab: TabTypes) {
    const { activeTab } = this.state;

    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  public renderToggleButton() {
    const { songIdParam, playTrack, relatedPlaylistId, playingTrack } = this.props;

    // TODO redundant?

    if (playingTrack && playingTrack.id !== null && playingTrack.id === songIdParam) {
      return <TogglePlayButton className="c_btn round colored" />;
    }

    const playTrackFunc = () => {
      playTrack(relatedPlaylistId, { id: songIdParam });
    };

    return (
      <a href="javascript:void(0)" className="c_btn round colored" onClick={playTrackFunc}>
        <i className="bx bx-play" />
      </a>
    );
  }

  // tslint:disable-next-line: max-func-body-length
  public render() {
    const {
      // Vars
      match: {
        params: { songId }
      },
      auth: { likes, reposts },
      relatedPlaylistId,
      comments,
      isRelatedPlaylistsPlaying,
      relatedTracks,
      track,

      // Functions
      toggleLike,
      toggleRepost,
      addUpNext,
      canFetchMoreOf,
      fetchMore,
      user
    } = this.props;

    const { activeTab } = this.state;

    if (!track || (track && track.loading)) {
      return <Spinner contained />;
    }

    const liked = SC.hasID(track.id, likes.track);
    const reposted = SC.hasID(track.id, reposts.track);

    const image = SC.getImageUrl({ ...track, user }, IMAGE_SIZES.LARGE);

    const purchaseTitle = track.purchase_title || 'Download';

    const likedIcon = liked ? 'bx bxs-heart' : 'bx bx-heart';

    return (
      <>
        <SetLayoutSettings hasImage={!!image} />

        <PageHeader image={image}>
          <Row className="trackHeader">
            {image && (
              <Col xs="12" md="4" xl="3">
                <div className="imageWrapper">
                  <FallbackImage src={image} />
                </div>
              </Col>
            )}

            <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
              <h2>{track.title}</h2>

              <div className="button-group">
                {SC.isStreamable(track) ? (
                  this.renderToggleButton()
                ) : (
                  <a href="javascript:void(0)" className="disabled c_btn">
                    <span>This track is not streamable</span>
                  </a>
                )}

                <a
                  href="javascript:void(0)"
                  className={cn('c_btn', { active: liked })}
                  onClick={() => {
                    toggleLike(track.id);
                  }}>
                  <i className={likedIcon} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </a>

                <a
                  href="javascript:void(0)"
                  className={cn('c_btn', { active: reposted })}
                  onClick={() => {
                    toggleRepost(track.id);
                  }}>
                  <i className="bx bx-repost" />
                  <span>{reposted ? 'Reposted' : 'Repost'}</span>
                </a>

                {!track.purchase_url && track.download_url && track.downloadable && (
                  <a
                    href="javascript:void(0)"
                    className="c_btn round"
                    onClick={() => {
                      IPC.downloadFile(SC.appendClientId(track.download_url));
                    }}>
                    <i className="bx bxs-download-alt" />
                  </a>
                )}

                <Popover
                  autoFocus={false}
                  minimal
                  position={Position.BOTTOM_LEFT}
                  content={
                    <Menu>
                      {track.purchase_url && (
                        <>
                          {track.purchase_url && (
                            <MenuItem
                              icon="link"
                              text={purchaseTitle}
                              onClick={() => {
                                IPC.openExternal(track.purchase_url);
                              }}
                            />
                          )}

                          <MenuDivider />
                        </>
                      )}

                      <MenuItem text="Add to playlist">
                        <div
                          style={{
                            fontSize: '.8rem',
                            opacity: 0.8,
                            color: 'grey',
                            padding: '5px'
                          }}>
                          I'm sorry, this feature has been disabled to preserve your playlists. Since we are unable to
                          fetch all tracks, we do not know for sure if we will delete tracks upon adding/removing track
                          via Auryo.
                        </div>
                        {/* {
                                                    userPlaylists.map((playlist) => {
                                                        const inPlaylist = !!playlist.items.find((t) => t.id === track.id);

                                                        return (
                                                            <MenuItem
                                                                key={`menu-item-add-to-playlist-${playlist.id}`}
                                                                className={cn({ 'text-primary': inPlaylist })}
                                                                onClick={() => {
                                                                    togglePlaylistTrack(track.id, playlist.id);
                                                                }}
                                                                text={playlist.title}
                                                            />
                                                        );
                                                    })
                                                } */}
                      </MenuItem>

                      <MenuItem
                        text="Add to queue"
                        onClick={() => {
                          addUpNext(track);
                        }}
                      />

                      <MenuDivider />

                      <MenuItem
                        text="View in browser"
                        onClick={() => {
                          IPC.openExternal(track.permalink_url);
                        }}
                      />

                      <ShareMenuItem
                        title={track.title}
                        permalink={track.permalink_url}
                        username={_.get(track, 'user.username', '')}
                      />
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
              className={cn({ active: activeTab === TabTypes.OVERVIEW })}
              onClick={() => this.toggle(TabTypes.OVERVIEW)}>
              Overview
            </a>

            <a
              href="javascript:void(0)"
              className={cn({
                active: activeTab === TabTypes.RELATED_TRACKS,
                playing: isRelatedPlaylistsPlaying
              })}
              onClick={() => this.toggle(TabTypes.RELATED_TRACKS)}>
              Related tracks
            </a>
          </div>
        </PageHeader>

        <div className="trackDetails container-fluid main_track_content detailPage">
          <TabContent activeTab={activeTab}>
            {/* OVERVIEW */}
            <TabPane tabId={TabTypes.OVERVIEW} className="overview">
              <TrackOverview
                track={track}
                comments={comments}
                hasMore={canFetchMoreOf(songId, ObjectTypes.COMMENTS) as any}
                loadMore={() => fetchMore(songId, ObjectTypes.COMMENTS) as any}
              />
            </TabPane>

            {/* RELATED TRACKS */}
            {/* TODO ADD Spinner */}
            <TabPane tabId={TabTypes.RELATED_TRACKS} className="trackPadding-side">
              {relatedTracks && activeTab === TabTypes.RELATED_TRACKS && (
                <TrackList objectId={relatedPlaylistId} items={relatedTracks.items} hideFirstTrack />
              )}
            </TabPane>
          </TabContent>
        </div>
      </>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(TrackPage);
