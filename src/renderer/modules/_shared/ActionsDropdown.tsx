import { Position } from '@blueprintjs/core';
import { Menu } from '@blueprintjs/core/lib/cjs/components/menu/menu';
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider';
import { MenuItem } from '@blueprintjs/core/lib/cjs/components/menu/menuItem';
import { Popover } from '@blueprintjs/core/lib/cjs/components/popover/popover';
import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { StoreState } from '../../../shared/store';
import { AuthLikes, AuthReposts } from '../../../shared/store/auth';
import { addUpNext } from '../../../shared/store/player';
import { togglePlaylistTrack } from '../../../shared/store/playlist/playlist';
import { toggleLike, toggleRepost } from '../../../shared/store/track/actions';
import { SC } from '../../../shared/utils';
import { IPC } from '../../../shared/utils/ipc';
import { Normalized, SoundCloud } from '../../../types';
import ShareMenuItem from './ShareMenuItem';

interface OwnProps {
    track: SoundCloud.Music;
    index?: number;
}

interface PropsFromState {
    likes: AuthLikes;
    reposts: AuthReposts;
    playlists: Normalized.Playlist[]
}

interface PropsFromDispatch {
    addUpNext: typeof addUpNext;
    toggleLike: typeof toggleLike;
    toggleRepost: typeof toggleRepost;
    togglePlaylistTrack: typeof togglePlaylistTrack;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class ActionsDropdown extends React.Component<AllProps> {

    shouldComponentUpdate(nextProps: AllProps) {
        const { track, likes, index, reposts, playlists } = this.props;

        return track.id !== nextProps.track.id ||
            index !== nextProps.index ||
            !isEqual(likes, nextProps.likes) ||
            !isEqual(reposts, nextProps.reposts) ||
            !isEqual(playlists, nextProps.playlists)
    }

    render() {
        const { toggleLike, toggleRepost, reposts, likes, track, addUpNext, index, playlists, togglePlaylistTrack } = this.props

        const trackId = track.id

        const liked = SC.hasID(track.id, (track.kind === 'playlist' ? likes.playlist : likes.track))
        const reposted = SC.hasID(track.id, reposts)

        return (
            <Popover className="actions-dropdown" autoFocus={false} minimal content={(
                <Menu>
                    <MenuItem className={cn({ 'text-primary': liked })} text={liked ? 'Liked' : 'Like'}
                        onClick={() => toggleLike(trackId, track.kind === 'playlist')} />

                    <MenuItem className={cn({ 'text-primary': reposted })} text={reposted ? 'Reposted' : 'Repost'}
                        onClick={() => toggleRepost(trackId)} />

                    <MenuItem text="Add to queue" onClick={() => addUpNext(track)} />

                    {
                        track.kind !== 'playlist' ? (
                            <MenuItem text="Add to playlist">
                                {
                                    playlists.map(playlist => {

                                        const inPlaylist = !!playlist.tracks.find(t => t.id === trackId)

                                        return (
                                            <MenuItem
                                                key={`menu-item-add-to-playlist-${playlist.id}`}
                                                className={cn({ 'text-primary': inPlaylist })}
                                                onClick={togglePlaylistTrack.bind(null, trackId, playlist.id)}
                                                text={playlist.title} />
                                        )
                                    })
                                }
                            </MenuItem>
                        ) : null
                    }


                    {
                        index ? (
                            <MenuItem text="Remove from queue" onClick={() => addUpNext(track, true)} />
                        ) : null
                    }

                    <MenuDivider />

                    <MenuItem
                        text="View in browser"
                        onClick={() => {
                            IPC.openExternal(track.permalink_url)
                        }} />
                    <ShareMenuItem
                        title={track.title}
                        permalink={track.permalink_url}
                        username={track.user.username} />

                </Menu>
            )} position={Position.BOTTOM_LEFT}>
                <a href="javascript:void(0)">
                    <i className="icon-more_horiz" />
                </a>
            </Popover>
        )
    }
}

const mapStateToProps = (state: StoreState): PropsFromState => {
    const { auth: { playlists, likes, reposts }, entities } = state
    const { playlistEntities } = entities

    return {
        playlists: playlists.map((result) => playlistEntities[result.id]),
        likes,
        reposts
    }
}

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    addUpNext,
    toggleLike,
    toggleRepost,
    togglePlaylistTrack,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)