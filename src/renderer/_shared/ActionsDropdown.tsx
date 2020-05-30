import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import { addUpNext, toggleLike, toggleRepost } from '@common/store/actions';
import { getNormalizedSchemaForType, hasLiked } from '@common/store/selectors';
import { IPC } from '@common/utils/ipc';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SoundCloud } from '../../types';
import ShareMenuItem from './ShareMenuItem';

interface Props {
  trackOrPlaylist: SoundCloud.Playlist | SoundCloud.Track;
  index?: number;
  playing?: boolean;
  currentPlaylistId?: string;
}

export const ActionsDropdown: FC<Props> = ({ trackOrPlaylist }) => {
  const dispatch = useDispatch();
  const isLiked = useSelector(hasLiked(trackOrPlaylist.id, trackOrPlaylist.kind));
  const isReposted = useSelector(hasLiked(trackOrPlaylist.id, trackOrPlaylist.kind));
  const idResult = getNormalizedSchemaForType(trackOrPlaylist);

  const likedText = isLiked ? 'Liked' : 'Like';
  const repostedText = isReposted ? 'Reposted' : 'Repost';

  return (
    <Popover
      className="actions-dropdown"
      autoFocus={false}
      minimal
      position={Position.BOTTOM_LEFT}
      content={
        <Menu>
          <MenuItem
            className={cn({ 'text-primary': isLiked })}
            text={likedText}
            onClick={() => dispatch(toggleLike.request({ id: trackOrPlaylist.id, type: trackOrPlaylist.kind }))}
          />

          <MenuItem
            className={cn({ 'text-primary': isReposted })}
            text={repostedText}
            onClick={() => dispatch(toggleRepost.request({ id: trackOrPlaylist.id, type: trackOrPlaylist.kind }))}
          />

          <MenuItem text="Add to queue" onClick={() => dispatch(addUpNext.request(idResult))} />

          {/* {index !== undefined && !playing ? (
            <MenuItem text="Remove from queue" onClick={() => addUpNext(trackOrPlaylist, index)} />
          ) : null} */}

          <MenuDivider />

          <MenuItem text="View in browser" onClick={() => IPC.openExternal(trackOrPlaylist.permalink_url)} />
          <ShareMenuItem
            title={trackOrPlaylist.title}
            permalink={trackOrPlaylist.permalink_url}
            username={trackOrPlaylist.user.username}
          />
        </Menu>
      }>
      <a href="javascript:void(0)">
        <i className="bx bx-dots-horizontal-rounded" />
      </a>
    </Popover>
  );
};
