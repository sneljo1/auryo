import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../../shared/actions/index'
import { getReadableTime, SC } from '../../../shared/utils/index'
import { IMAGE_SIZES, OBJECT_TYPES } from '../../../shared/constants/index'
import './playlist.scss'
import TracksGrid from '../_shared/TracksGrid/tracksGrid.component'
import Spinner from '../_shared/Spinner/spinner.component'
import cn from 'classnames'
import { PLAYER_STATUS } from '../../modules/player/constants/player'
import img from '../../../assets/img/search.jpg'
import CustomScroll from '../_shared/CustomScroll'
import debounce from 'lodash/debounce'
import { withRouter } from 'react-router-dom'
import { denormalize, schema } from 'normalizr'
import trackSchema from '../../../shared/schemas/track'

class PlaylistContainer extends Component {

    componentDidMount() {
        const { fetchPlaylistIfNeeded, playlistId } = this.props

        fetchPlaylistIfNeeded(playlistId)


        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

        this.debouncedSetScroll = debounce(this.props.setScrollPosition, 10)
    }

    componentWillReceiveProps(nextProps) {
        const { fetchPlaylistIfNeeded, playlistId } = this.props

        if (playlistId !== nextProps.playlistId) {
            fetchPlaylistIfNeeded(nextProps.playlistId)
        }
    }

    renderPlayButton = () => {
        const {
            playlist_object,
            playlistId,
            player,
            playTrack,
            toggleStatus

        } = this.props

        const first_id = playlist_object.items[0]

        if (player.currentPlaylistId === playlistId && player.status === PLAYER_STATUS.PLAYING) {
            return (
                <a href="javascript:void(0)" className="c_btn"
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
            items,
            entities,
            playlist_object,
            playlist_entity,
            playlistId,
            player,
            auth: { likes, reposts },

            // Functions
            show,
            toggleLike,
            playTrack,
            fetchPlaylistIfNeeded,
            fetchPlaylistTracks,
            canFetchPlaylistTracks,
            deletePlaylist,
            addUpNext,
            toggleRepost
        } = this.props

        if (!playlist_object || !playlist_entity) {
            return <Spinner />
        }

        const first_id = playlist_object.items[0]
        const first_item = items[0]

        const liked = SC.hasID(playlistId, likes.playlist)

        return (
            <CustomScroll heightRelativeToParent="100%"
                          allowOuterScroll={true}
                          threshold={300}
                          isFetching={playlist_object.isFetching}
                          ref={r => this.scroll = r}
                          loadMore={fetchPlaylistTracks.bind(null, playlistId)}
                          loader={<Spinner />}
                          onScroll={this.debouncedSetScroll}
                          hasMore={canFetchPlaylistTracks(playlistId)}>
                <div id='playlist-header' className="hasImage">
                    {
                        playlist_entity.artwork_url || (first_item && first_item.artwork_url) ? (
                            <div className='imgOverlay'
                                 style={{ backgroundImage: 'url(' + SC.getImageUrl(playlist_entity.artwork_url || first_item.artwork_url, IMAGE_SIZES.XSMALL) + ')' }} />
                        ) : <div className="imgOverlay" style={{ backgroundImage: 'url(' + img + ')' }} />
                    }

                    <div id='playlist-info' className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1>{playlist_entity.title}</h1>
                            <ul className='d-flex playlist-stats'>
                                <li className="d-flex align-items-center">
                                    <i className='icon-disc' />
                                    <span>{playlist_entity.track_count}</span>
                                </li>
                                <li className="d-flex align-items-center">
                                    <i className='icon-clock' />
                                    <span>{getReadableTime(playlist_entity.duration, true, true)}</span>
                                </li>
                            </ul>

                            <div id="playlist-buttons">
                                {
                                    first_id ? (
                                        this.renderPlayButton()
                                    ) : null
                                }


                                {
                                    playlist_object.items.length ? (
                                        <a href="javascript:void(0)" className={cn('c_btn', { liked: liked })}
                                           onClick={toggleLike.bind(this, playlist_entity.id, true)}>
                                            <i className={liked ? 'icon-favorite' : 'icon-favorite_border'} />
                                            <span>{liked ? 'Liked' : 'Like'}</span>
                                        </a>
                                    ) : null
                                }


                                {
                                    playlist_object.items.length ? (
                                        <a href="javascript:void(0)" className="c_btn"
                                           onClick={addUpNext.bind(this, playlist_entity.id, items, null)}>
                                            <i className="icon-playlist_play" /> <span>Add to queue</span>
                                        </a>
                                    ) : null
                                }


                                {/*<a href='javascript:void(0)' className='c_btn'
                         {
                         items.user_id === me.id ? (
                         <a href="javascript:void(0)" className="c_btn"
                         onClick={deletePlaylist.bind(null, playlistId)}>
                         <i className="icon-close"/>
                         Delete
                         </a>
                         ) : null
                         }
                         </a>*/}
                            </div>
                        </div>

                    </div>

                </div>
                {
                    !playlist_object.isFetching && playlist_object.items.length === 0 && items.duration !== 0 ? (
                        <div className="py-4"><h4 className="text-center p-5">This <a target="_blank"
                                                                                      href={playlist_entity.permalink_url}>playlist </a>
                            is empty or not available via a third party!</h4></div>
                    ) : <TracksGrid
                        items={items}
                        likes={likes}
                        reposts={reposts}
                        player={player}
                        playlist_name={playlistId}
                        entities={entities}

                        show={show}
                        toggleLike={toggleLike}
                        toggleRepost={toggleRepost}
                        addUpNext={addUpNext}
                        playTrackFunc={playTrack}
                        fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded} />
                }
            </CustomScroll>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { entities, objects, player, auth, ui } = state
    const { playlist_entities } = entities

    const { match: { params: { playlistId } }, location, history } = props

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}
    const playlist_object = playlist_objects[playlistId]

    let denormalized = []

    if (playlist_object) {
        denormalized = denormalize(playlist_object.items, new schema.Array(trackSchema), entities)
    }

    return {
        auth,
        player,
        entities,
        items: denormalized,
        playlist_entity: playlist_entities[playlistId],
        playlist_object,
        playlistId,
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, actions)(PlaylistContainer))