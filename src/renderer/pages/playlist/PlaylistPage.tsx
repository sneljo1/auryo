import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { addUpNext, genericPlaylistFetchMore, getGenericPlaylist, openExternalUrl } from '@common/store/actions';
import {
  getAuthPlaylistsSelector,
  getNormalizedPlaylist,
  getNormalizedTrack,
  getNormalizedUser,
  getPlaylistObjectSelector
} from '@common/store/selectors';
import { LikeType, PlaylistTypes, RepostType } from '@common/store/types';
import { getReadableTimeFull, SC } from '@common/utils';
import { useLoadMorePromise } from '@renderer/hooks/useLoadMorePromise';
import { SetLayoutSettings } from '@renderer/_shared/context/contentContext';
import { ToggleLikeButton } from '@renderer/_shared/PageHeader/components/ToggleLikeButton';
import { TogglePlayButton } from '@renderer/_shared/PageHeader/components/TogglePlayButton';
import { ToggleRepostButton } from '@renderer/_shared/PageHeader/components/ToggleRepostButton';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { usePrevious } from 'react-use';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';
import './PlaylistPage.scss';

type Props = RouteComponentProps<{ playlistId: string }>;

const PlaylistPage: FC<Props> = ({
  match: {
    params: { playlistId: objectId }
  }
}) => {
  const playlistType = PlaylistTypes.PLAYLIST;
  const playlist = useSelector(getNormalizedPlaylist(objectId));
  const authPlaylists = useSelector(getAuthPlaylistsSelector);
  const playlistObject = useSelector(getPlaylistObjectSelector({ objectId, playlistType }));
  const playlistUser = useSelector(getNormalizedUser(playlist?.user));
  const firstItem = useSelector(getNormalizedTrack(playlist?.tracks?.[0]?.id));
  const isPersonalisedPlaylist = objectId.startsWith('soundcloud:');

  const dispatch = useDispatch();
  const previousObjectId = usePrevious(objectId);

  useEffect(() => {
    if (isPersonalisedPlaylist) {
      dispatch(stopForwarding(genericPlaylistFetchMore.request({ objectId, playlistType })));
    } else if (objectId !== previousObjectId) {
      dispatch(
        stopForwarding(
          getGenericPlaylist.request({
            objectId,
            playlistType,
            refresh: true
          })
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId]);

  const { loadMore } = useLoadMorePromise(
    playlistObject?.isFetching,
    () => {
      dispatch(stopForwarding(genericPlaylistFetchMore.request({ objectId, playlistType })));
    },
    [dispatch, objectId]
  );

  const playlistID = useMemo(() => ({ objectId, playlistType: PlaylistTypes.PLAYLIST }), [objectId]);

  if (
    !playlist ||
    !playlistObject ||
    (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)
  ) {
    return <Spinner contained />;
  }

  const hasImage = playlist.artwork_url || (firstItem && firstItem.artwork_url);

  const playlistOwned = authPlaylists.owned.find((p) => p.id === playlist.id);

  const isEmpty =
    !playlistObject.isFetching &&
    ((playlist.tracks?.length === 0 && playlist.duration === 0) || playlist.track_count === 0);

  const image = hasImage ? SC.getImageUrl(playlist.artwork_url || firstItem?.artwork_url, IMAGE_SIZES.XLARGE) : null;

  const permalink = isPersonalisedPlaylist
    ? `https://soundcloud.com/discover/sets/${playlist.permalink}`
    : playlist.permalink_url;

  const description = isPersonalisedPlaylist
    ? playlist.description
    : `${playlist.track_count} titles - ${getReadableTimeFull(playlist.duration, true)}`;

  return (
    <>
      <SetLayoutSettings hasImage={hasImage} />

      <PageHeader image={image} title={playlist.title} subtitle={description}>
        <div>
          <div className="button-group">
            {!!firstItem && !isEmpty && <TogglePlayButton colored playlistID={playlistID} />}

            {!isEmpty && !playlistOwned && !isPersonalisedPlaylist && (
              <ToggleLikeButton id={objectId} type={LikeType.Playlist} />
            )}

            {!isEmpty && !playlistOwned && !isPersonalisedPlaylist && (
              <ToggleRepostButton id={objectId} type={RepostType.Playlist} />
            )}

            {!isEmpty && (
              <Popover
                autoFocus={false}
                minimal
                position={Position.BOTTOM_LEFT}
                content={
                  <Menu>
                    {!isEmpty ? (
                      <>
                        <MenuItem
                          text="Add to queue"
                          onClick={() => {
                            dispatch(addUpNext.request({ id: +objectId, schema: 'playlists' }));
                          }}
                        />
                        <MenuDivider />
                      </>
                    ) : null}

                    <MenuItem
                      text="View in browser"
                      onClick={() => {
                        dispatch(openExternalUrl(permalink));
                      }}
                    />
                    {playlistUser && !isPersonalisedPlaylist && (
                      <ShareMenuItem title={playlist.title} permalink={permalink} username={playlistUser.username} />
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
            <a target="_blank" rel="noopener noreferrer" href={permalink}>
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
          playlistID={{ playlistType, objectId }}
          isLoading={playlistObject.isFetching}
          isItemLoaded={(index) => !!playlistObject.items[index]}
          loadMore={loadMore}
          hasMore={!!playlistObject.itemsToFetch.length && !playlistObject.error && !playlistObject.isFetching}
        />
      )}
    </>
  );
};

export default PlaylistPage;
