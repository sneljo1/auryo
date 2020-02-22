import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { getNormalizedPlaylist, getNormalizedTrack, getNormalizedUser } from '@common/store/entities/selectors';
import { getPlaylistObjectSelector } from '@common/store/objects/selectors';
import { PlayerStatus } from '@common/store/player';
import { getReadableTimeFull, SC } from '@common/utils';
import { IPC } from '@common/utils/ipc';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';
import './PlaylistPage.scss';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const {
    player: { currentPlaylistId, status },
    auth
  } = state;
  const {
    match: {
      params: { playlistId }
    }
  } = props;

  const isPlayerPlaylist = currentPlaylistId === playlistId;
  const isPlaylistPlaying = isPlayerPlaylist && status === PlayerStatus.PLAYING;

  const playlist = getNormalizedPlaylist(playlistId as any)(state);

  return {
    auth,
    isPlayerPlaylist,
    isPlaylistPlaying,
    playlistObject: getPlaylistObjectSelector(playlistId)(state),
    playlistIdParam: playlistId as any,

    playlist,
    playlistUser: playlist?.user && getNormalizedUser(playlist.user)(state),
    firstItem: playlist && playlist?.tracks?.length > 1 && getNormalizedTrack(playlist.tracks[0].id)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      playTrack: actions.playTrack,
      toggleLike: actions.toggleLike,
      toggleRepost: actions.toggleRepost,
      fetchPlaylistIfNeeded: actions.fetchPlaylistIfNeeded,
      fetchPlaylistTracks: actions.fetchPlaylistTracks,
      addUpNext: actions.addUpNext,
      toggleStatus: actions.toggleStatus
    },
    dispatch
  );

type OwnProps = RouteComponentProps<{ playlistId: string }>;

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
  scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class PlaylistPage extends React.Component<AllProps, State> {
  public componentDidMount() {
    const { fetchPlaylistIfNeeded, playlistIdParam } = this.props;

    fetchPlaylistIfNeeded(playlistIdParam);
  }

  public componentDidUpdate(prevProps: AllProps) {
    const { fetchPlaylistIfNeeded, playlistIdParam } = this.props;

    if (playlistIdParam !== prevProps.playlistIdParam) {
      fetchPlaylistIfNeeded(playlistIdParam);
    }
  }

  public renderPlayButton() {
    const { playlist, playlistIdParam, isPlayerPlaylist, isPlaylistPlaying, playTrack, toggleStatus } = this.props;

    if (!playlist) {
      return null;
    }

    if (isPlaylistPlaying) {
      return (
        <a
          href="javascript:void(0)"
          className="c_btn round colored"
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
        playTrack(playlistIdParam.toString());
      }
    };

    return (
      <a href="javascript:void(0)" className="c_btn round colored" onClick={toggle}>
        <i className="bx bx-play" />
      </a>
    );
  }

  // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
  public render() {
    const {
      // Vars
      playlistObject,
      playlist,
      auth,
      playlistIdParam,
      firstItem,
      playlistUser,
      // Functions
      toggleLike,
      toggleRepost,
      fetchPlaylistTracks,
      addUpNext
    } = this.props;

    const { likes, playlists, reposts } = auth;

    if (
      !playlistObject ||
      !playlist ||
      (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)
    ) {
      return <Spinner contained />;
    }

    const hasImage = playlist.artwork_url || (firstItem && firstItem.artwork_url);

    const liked = SC.hasID(playlistIdParam, likes.playlist);
    const reposted = SC.hasID(playlistIdParam, reposts.playlist);
    const playlistOwned = playlists.find(p => p.id === playlist.id);

    const isEmpty =
      !playlistObject.isFetching &&
      ((playlist.tracks.length === 0 && playlist.duration === 0) || playlist.track_count === 0);

    const likedIcon = liked ? 'bx bxs-heart' : 'bx bx-heart';
    const image = hasImage
      ? SC.getImageUrl(playlist.artwork_url || (firstItem && firstItem.artwork_url), IMAGE_SIZES.XLARGE)
      : null;

    const hasMore = playlistObject.items.length > playlistObject.fetchedItems;

    return (
      <>
        <SetLayoutSettings hasImage={hasImage} />

        <PageHeader image={image}>
          <h2>{playlist.title}</h2>
          <div>
            <div className="stats">
              {playlist.track_count} titles -{getReadableTimeFull(playlist.duration, true)}
            </div>

            <div className="button-group">
              {firstItem && !isEmpty ? this.renderPlayButton() : null}

              {playlist.tracks.length && !playlistOwned ? (
                <a
                  href="javascript:void(0)"
                  className={cn('c_btn', { active: liked })}
                  onClick={() => {
                    toggleLike(playlist.id, true);
                  }}>
                  <i className={likedIcon} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </a>
              ) : null}

              {playlist.tracks.length && !playlistOwned ? (
                <a
                  href="javascript:void(0)"
                  className={cn('c_btn', { 'text-primary': reposted })}
                  onClick={() => {
                    toggleRepost(playlist.id, true);
                  }}>
                  <i className="bx bx-repost" />
                  <span>{reposted ? 'Reposted' : 'Repost'}</span>
                </a>
              ) : null}

              {!isEmpty && (
                <Popover
                  autoFocus={false}
                  minimal
                  position={Position.BOTTOM_LEFT}
                  content={
                    <Menu>
                      {playlist.tracks.length ? (
                        <>
                          <MenuItem
                            text="Add to queue"
                            onClick={() => {
                              addUpNext(playlist);
                            }}
                          />
                          <MenuDivider />
                        </>
                      ) : null}

                      <MenuItem
                        text="View in browser"
                        onClick={() => {
                          IPC.openExternal(playlist.permalink_url);
                        }}
                      />
                      {playlistUser && (
                        <ShareMenuItem
                          title={playlist.title}
                          permalink={playlist.permalink_url}
                          username={playlistUser.username}
                        />
                      )}
                    </Menu>
                  }>
                  <a href="javascript:void(0)" className="c_btn round">
                    <i className="bx bx-dots-horizontal-rounded" />
                  </a>
                </Popover>
              )}
            </div>
          </div>
        </PageHeader>
        {isEmpty ? (
          <div
            className={cn({
              'mt-5': !hasImage
            })}>
            <h5 className="text-muted text-center">
              This{' '}
              <a target="_blank" rel="noopener noreferrer" href={playlist.permalink_url}>
                playlist
              </a>{' '}
              is empty or not available via a third party!
            </h5>
            <div className="text-center" style={{ fontSize: '5rem' }}>
              <span role="img">😲</span>
            </div>
          </div>
        ) : (
          <TracksGrid
            items={playlistObject.items}
            objectId={playlistIdParam.toString()}
            isLoading={playlistObject.isFetching}
            isItemLoaded={index => index < playlistObject.fetchedItems}
            loadMore={() => fetchPlaylistTracks(playlistIdParam, 30) as any}
            hasMore={hasMore}
          />
        )}
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistPage);
