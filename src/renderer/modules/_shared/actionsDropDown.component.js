import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { Position } from '@blueprintjs/core/lib/esm/index'
import { Popover } from '@blueprintjs/core/lib/cjs/components/popover/popover'
import { Menu } from '@blueprintjs/core/lib/cjs/components/menu/menu'
import { MenuItem } from '@blueprintjs/core/lib/cjs/components/menu/menuItem'
import ShareMenuItem from './ShareMenuItem'
import * as actions from '../../../shared/actions'
import { openExternal } from '../../../shared/actions'
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import { OBJECT_TYPES } from '../../../shared/constants'
import { SC } from '../../../shared/utils/index'

class ActionsDropdown extends React.Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.track.id !== nextProps.track.id ||
            this.props.liked !== nextProps.liked ||
            this.props.index !== nextProps.index ||
            this.props.reposted !== nextProps.reposted ||
            !isEqual(this.props.playlists, nextProps.playlists)
    }

    onClick = (e) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
    }

    render() {
        const { toggleLike, toggleRepost, reposted, liked, track, addUpNext, index, playlists, togglePlaylistTrack, playlist_objects } = this.props

        const trackId = track.id

        return (
            <Popover className="actions-dropdown" autoFocus={false} minimal={true} content={(
                <Menu>
                    <MenuItem className={cn({ 'text-primary': liked })} text={liked ? 'Liked' : 'Like'}
                              onClick={(e) => {
                                  this.onClick(e)
                                  toggleLike(trackId, track.kind === 'playlist')
                              }} />
                    <MenuItem className={cn({ 'text-primary': reposted })} text={reposted ? 'Reposted' : 'Repost'}
                              onClick={(e) => {
                                  this.onClick(e)
                                  toggleRepost(trackId)
                              }} />

                    <MenuItem text="Add to queue" onClick={(e) => {
                        this.onClick(e)
                        addUpNext(trackId, track.kind === 'playlist' ? track : null)
                    }} />

                    {
                        track.kind !== 'playlist' ? (
                            <MenuItem text="Add to playlist">
                                {
                                    playlists.map(playlist => {

                                        const items = playlist_objects[playlist.id].items || []

                                        const inPlaylist = items.indexOf(trackId) !== -1

                                        return (
                                            <MenuItem
                                                key={playlist.id}
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
                        index !== undefined ? (
                            <MenuItem text="Remove from queue" onClick={(e) => {
                                this.onClick(e)
                                addUpNext(trackId, track.kind === 'playlist' ? track : null, index)
                            }} />
                        ) : null
                    }

                    <MenuDivider />

                    <MenuItem
                        text="View in browser"
                        onClick={openExternal.bind(this, track.permalink_url)} />
                    <ShareMenuItem title={track.title} permalink={track.permalink_url} username={track.user.username} />

                </Menu>
            )} position={Position.BOTTOM_LEFT}>
                <a href="javascript:void(0)">
                    <i className="icon-more_horiz" />
                </a>
            </Popover>
        )
    }
}

ActionsDropdown.propTypes = {
    liked: PropTypes.bool.isRequired,
    reposted: PropTypes.bool.isRequired,
    track: PropTypes.object.isRequired,
    playlists: PropTypes.array.isRequired,
    index: PropTypes.number,


    show: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired,
    toggleLike: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    togglePlaylistTrack: PropTypes.func.isRequired

}

const mapStateToProps = (state, { track }) => {
    const { auth: { playlists, likes, reposts }, entities, objects } = state
    const { playlist_entities } = entities

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}

    const liked = SC.hasID(track.id, (track.kind === 'playlist' ? likes.playlist : likes.track))
    const reposted = SC.hasID(track.id, reposts)

    return {
        playlists: playlists.map(id => playlist_entities[id]),
        playlist_objects,
        liked, reposted

    }
}

export default connect(mapStateToProps, actions)(ActionsDropdown)