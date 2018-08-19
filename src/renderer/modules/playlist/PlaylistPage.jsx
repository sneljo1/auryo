/* eslint-disable react/no-this-in-sfc,jsx-a11y/accessible-emoji */
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider';
import cn from 'classnames';
import { denormalize } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actions from '../../../shared/actions';
import { IMAGE_SIZES, OBJECT_TYPES } from '../../../shared/constants';
import { playlistSchema } from '../../../shared/schemas';
import { getReadableTimeFull, SC } from '../../../shared/utils';
import Header from '../app/components/Header/Header';
import { PLAYER_STATUS } from '../../../shared/constants/player';
import CustomScroll from '../_shared/CustomScroll';
import PageHeader from '../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../_shared/ShareMenuItem';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import './playlist.scss';

class PlaylistContainer extends WithHeaderComponent {

    componentDidMount() {
        super.componentDidMount()

        const { fetchPlaylistIfNeeded, playlistId } = this.props

        fetchPlaylistIfNeeded(playlistId)

    }

    componentWillReceiveProps(nextProps) {
        const { fetchPlaylistIfNeeded, playlistId } = this.props

        if (playlistId !== nextProps.playlistId) {
            fetchPlaylistIfNeeded(nextProps.playlistId)
        }
    }

    renderPlayButton = () => {
        const {
            playlist_entity,
            playlistId,
            player,
            playTrack,
            toggleStatus
        } = this.props

        const first_id = playlist_entity.tracks[0].id

        if (player.currentPlaylistId === playlistId && player.status === PLAYER_STATUS.PLAYING) {
            return (
                <a href="javascript:void(0)" className="c_btn playing"
                    onClick={() => toggleStatus()}>
                    <i className="icon-pause" />
                    Playing
                </a>
            )
        }

        return (
            <a href="javascript:void(0)" className="c_btn"
                onClick={player.currentPlaylistId === playlistId ? toggleStatus.bind(null, null) : playTrack.bind(null, playlistId, first_id, null)}>
                <i className="icon-play_arrow" />
                Play
            </a>
        )
    }

    render() {
        const {
            // Vars
            entities,
            playlist_object,
            playlist_entity,
            playlistId,
            player,
            auth,

            // Functions
            toggleLike,
            playTrack,
            fetchPlaylistIfNeeded,
            fetchPlaylistTracks,
            canFetchPlaylistTracks,
            addUpNext
        } = this.props

        const { likes, playlists, followings } = auth

        if (!playlist_object || !playlist_entity) {
            return <Spinner contained />
        }

        const first_item = playlist_entity.tracks[0]
        const hasImage = playlist_entity.artwork_url || (first_item && first_item.artwork_url)

        const liked = SC.hasID(playlistId, likes.playlist)
        const playlistOwned = playlists.indexOf(playlist_entity.id) !== -1

        const openExternalFunc = actions.openExternal.bind(null, playlist_entity.permalink_url)

        const isEmpty = !playlist_object.isFetching && playlist_entity.tracks.length === 0 && playlist_entity.duration === 0

        return (
            <CustomScroll heightRelativeToParent="100%"
                heightMargin={35}
                allowOuterScroll
                threshold={300}
                isFetching={playlist_object.isFetching}
                ref={r => this.scroll = r}
                loadMore={fetchPlaylistTracks.bind(null, playlistId)}
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
                hasMore={canFetchPlaylistTracks(playlistId)}>

                <Header className={cn({
                    withImage: hasImage
                })} scrollTop={this.state.scrollTop} />
                <PageHeader
                    image={hasImage ? SC.getImageUrl(playlist_entity.artwork_url || first_item.artwork_url, IMAGE_SIZES.XLARGE) : null}>
                    <h2>{playlist_entity.title}</h2>
                    <div>
                        <div className='stats'>
                            {playlist_entity.track_count} titles{' - '}{getReadableTimeFull(playlist_entity.duration, true)}
                        </div>

                        <div className="button-group">
                            {
                                first_item ? (
                                    this.renderPlayButton()
                                ) : null
                            }


                            {
                                playlist_entity.tracks.length && !playlistOwned ? (
                                    <a href="javascript:void(0)" className={cn('c_btn', { liked })}
                                        onClick={toggleLike.bind(this, playlist_entity.id, true)}>
                                        <i className={liked ? 'icon-favorite' : 'icon-favorite_border'} />
                                        <span>{liked ? 'Liked' : 'Like'}</span>
                                    </a>
                                ) : null
                            }

                            {
                                !isEmpty && (
                                    <Popover autoFocus={false} minimal content={(
                                        <Menu>
                                            {
                                                playlist_entity.tracks.length ? (
                                                    <React.Fragment>
                                                        <MenuItem text="Add to queue"
                                                            onClick={addUpNext.bind(this, playlist_entity.id, playlist_entity.tracks, null)} />
                                                        <MenuDivider />
                                                    </React.Fragment>
                                                ) : null
                                            }

                                            <MenuItem
                                                text="View in browser"
                                                onClick={openExternalFunc} />
                                            <ShareMenuItem title={playlist_entity.title}
                                                permalink={playlist_entity.permalink_url}
                                                username={playlist_entity.user.username} />
                                        </Menu>
                                    )} position={Position.BOTTOM_LEFT}>
                                        <a href="javascript:void(0)" className="c_btn round">
                                            <i className="icon-more_horiz" />
                                        </a>
                                    </Popover>
                                )
                            }


                            {
                                // TODO: re-add deleting of playlists maybe? Takes a while before it actually deletes it, which is annoying
                            }

                            {/* <a href='javascript:void(0)' className='c_btn'
                         {
                         items.user_id === me.id ? (
                         <a href="javascript:void(0)" className="c_btn"
                         onClick={deletePlaylist.bind(null, playlistId)}>
                         <i className="icon-close"/>
                         Delete
                         </a>
                         ) : null
                         }
                         </a> */}
                        </div>
                    </div>
                </PageHeader>
                {
                    isEmpty ? (
                        <div className="pt-5 mt-5">
                            <h5 className='text-muted text-center'>
                                This{' '}<a target="_blank" rel="noopener noreferrer" href={playlist_entity.permalink_url}>playlist</a>{' '}
                                is empty or not available via a third party!</h5>
                            <div className="text-center" style={{ fontSize: '5rem' }}>
                                <span role="img">😲</span>
                            </div>
                        </div>
                    ) : (
                            <TracksGrid
                                followings={followings}
                                items={playlist_entity.tracks}
                                player={player}
                                playlist_name={playlistId}
                                entities={entities}
                                playTrackFunc={playTrack}
                                fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded} />

                        )
                }
            </CustomScroll>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { entities, objects, player, auth, ui } = state

    const { match: { params: { playlistId } }, location, history } = props

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}
    const playlist_object = playlist_objects[playlistId]

    const playlist = denormalize(playlistId, playlistSchema, entities)

    return {
        auth,
        player,
        entities,
        playlist_entity: playlist,
        playlist_object,
        playlistId,
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, actions)(PlaylistContainer))