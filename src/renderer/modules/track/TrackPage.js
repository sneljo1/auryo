import React from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import { Col, Row, TabContent, TabPane } from 'reactstrap'
import * as actions from '../../../shared/actions/index'
import { abbreviate_number, isCurrentPlaylistPlaying, SC } from '../../../shared/utils/index'
import { IMAGE_SIZES, OBJECT_TYPES, RELATED_PLAYLIST_SUFFIX } from '../../../shared/constants/index'
import Spinner from '../_shared/Spinner/spinner.component'
import TogglePlay from '../_shared/togglePlay.component'
import TrackList from '../_shared/TrackList/trackList.component'
import UserCard from '../_shared/UserCard/userCard.component'
import CommentList from '../_shared/CommentList/commentList.component'
import FallbackImage from '../_shared/FallbackImage'
import { openExternal } from '../../../shared/actions/app/window.actions'
import './track.scss'
import Linkify from '../_shared/linkify.component'
import CustomScroll from '../_shared/CustomScroll'
import { denormalize, schema } from 'normalizr'
import trackSchema from '../../../shared/schemas/track'
import { withRouter } from 'react-router-dom'
import Header from '../app/components/Header/Header'
import WithHeaderComponent from '../_shared/WithHeaderComponent'
import { Position } from '@blueprintjs/core/lib/esm/index'
import ShareMenuItem from '../_shared/ShareMenuItem'
import { MenuItem } from '@blueprintjs/core/lib/cjs/components/menu/menuItem'
import { MenuDivider } from '@blueprintjs/core/lib/cjs/components/menu/menuDivider'
import { Menu } from '@blueprintjs/core/lib/cjs/components/menu/menu'
import { Popover } from '@blueprintjs/core/lib/cjs/components/popover/popover'

class TrackPage extends WithHeaderComponent {

    state = {
        activeTab: '1'
    }

    componentDidMount() {
        const { fetchTrackIfNeeded, params: { songId } } = this.props

        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

        fetchTrackIfNeeded(songId)

        const new_tab = this.hasDescription(songId) ? '1' : '2'

        if (this.state.activeTab !== new_tab) {
            this.toggle(new_tab)
        }

    }

    componentWillReceiveProps(nextProps) {
        const { fetchTrackIfNeeded, params: { songId }, entities: { track_entities } } = this.props

        if (songId !== nextProps.params.songId || !track_entities[songId]) {
            const new_tab = this.hasDescription(nextProps.params.songId) ? '1' : '2'

            if (this.state.activeTab !== new_tab) {
                this.toggle(new_tab)
            }
        }

        if (songId !== nextProps.params.songId) {
            fetchTrackIfNeeded(nextProps.params.songId)
        }
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    hasDescription = () => {
        const { entities: { track_entities }, params: { songId } } = this.props

        const track = track_entities[songId]

        if (!track || !track.description) return false

        return track.description !== null && track.description.length > 0

    }

    renderToggleButton() {
        const { params: { songId }, playTrack, object_id, player: { queue, playingTrack } } = this.props

        if (playingTrack.id !== null && (playingTrack.id === parseInt(songId))) {
            return <TogglePlay className="c_btn round playButton" />
        }

        const playTrackFunc = playTrack.bind(null, object_id, parseInt(songId), null)

        const icon = (playingTrack.id === songId) ? 'pause' : 'play_arrow'

        return (

            <a href="javascript:void(0)" className="c_btn round playButton" onClick={playTrackFunc}>
                <i className={'icon-' + icon} />
            </a>
        )
    }

    toggleRepost(trackID, e) {
        e.preventDefault()

        this.props.toggleRepost(trackID)
    }

    fetchMore = () => {
        const { params: { songId }, fetchMore } = this.props

        if (this.state.activeTab === '3') {
            fetchMore(songId, OBJECT_TYPES.COMMENTS)
        }
    }

    canFetchMore = () => {
        const { params: { songId }, canFetchMoreOf } = this.props

        if (this.state.activeTab === '3') {
            canFetchMoreOf(songId, OBJECT_TYPES.COMMENTS)
        }

        return false
    }

    render() {
        const {
            // Vars
            entities: { track_entities, user_entities, comment_entities },
            params: { songId },
            auth: { likes, followings, reposts },
            player,
            object_id,
            track_comments,
            tracks,

            // Functions
            toggleFollowing,
            playTrack,
            show,
            toggleLike,
            toggleRepost,
            addUpNext
        } = this.props

        const { playingTrack } = player

        const track = track_entities[songId]

        if (!track) {
            return <Spinner contained />
        }

        const user = user_entities[track.user_id]

        const liked = SC.hasID(track.id, likes.track)
        const reposted = SC.hasID(track.id, reposts)

        const openExternalFunc = openExternal.bind(null, track.permalink_url)
        const toggleFollowingFunc = toggleFollowing.bind(null, track.user_id)
        const playTrackFunc = playTrack.bind(null, object_id)

        const playlist_playing = isCurrentPlaylistPlaying(player, object_id)


        const hasDesc = this.hasDescription()

        return (
            <CustomScroll heightRelativeToParent="100%"
                          allowOuterScroll={true}
                          threshold={300}
                          onScroll={this.debouncedOnScroll}
                          loadMore={this.fetchMore.bind(this)}
                          hasMore={this.canFetchMore()}>

                <Header scrollTop={this.state.scrollTop} />
                <div
                    className="trackDetails container-fluid d-flex flex-column">

                    <Row className="trackHeader">
                        <div className="overlayWrapper">

                            <FallbackImage
                                overflow
                                src={SC.getImageUrl(track, IMAGE_SIZES.LARGE)}
                                id={track.id}
                                className="overlayImg" />
                        </div>


                        <Col xs="12" md="4" xl="2">
                            <div className="imageWrapper">

                                <FallbackImage
                                    src={SC.getImageUrl(track, IMAGE_SIZES.LARGE)}
                                    id={track.id} />

                                <FallbackImage
                                    src={SC.getImageUrl(track, IMAGE_SIZES.LARGE)}
                                    id={track.id}
                                    className="imgShadow" />

                                <div className="row justify-content-center trackStats">
                                    <div className="stat col-xs">
                                        <i className="icon-favorite_border" />
                                        <span>{abbreviate_number(track.favoritings_count)}</span>
                                    </div>
                                    <div className="stat col-xs">
                                        <i className="icon-play_arrow" />
                                        <span>{abbreviate_number(track.playback_count)}</span>
                                    </div>
                                    <div className="stat col-xs">
                                        <i className="icon-retweet" />
                                        <span>{abbreviate_number(track.reposts_count)}</span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
                            <h1 className="trackTitle">{track.title}</h1>
                            <h2 className="trackArtist">{user.username}</h2>

                            <div
                                className="flex trackActions flex-wrap justify-content-center justify-content-md-start">
                                {
                                    track.streamable || track.kind === 'playlist' ? this.renderToggleButton() :
                                        <a href="javascript:void(0)" className="disabled c_btn">
                                            <span>This track is not streamable</span>
                                        </a>
                                }

                                <a href="javascript:void(0)" className={cn('c_btn', { liked: liked })}
                                   onClick={toggleLike.bind(this, track.id, false)}>
                                    <i className={liked ? 'icon-favorite' : 'icon-favorite_border'} />
                                    <span>{liked ? 'Liked' : 'Like'}</span>
                                </a>


                                <a href="javascript:void(0)" className={cn('c_btn', { liked: reposted })}
                                   onClick={toggleRepost.bind(null, track.id)}>
                                    <i className="icon-retweet" />
                                    <span>{reposted ? 'Reposted' : 'Repost'}</span>
                                </a>

                                <a href="javascript:void(0)" className={cn('c_btn')}
                                   onClick={() => {
                                       show('addToPlaylist', { trackID: track.id })
                                   }}>
                                    <i className="icon-playlist_add" />
                                    <span>Add to playlist</span>
                                </a>

                                <Popover autoFocus={false} minimal={true} content={(
                                    <Menu>
                                        <MenuItem text="Add to queue"
                                                  onClick={addUpNext.bind(null, track.id, null, null)} />
                                        <MenuDivider />

                                        <MenuItem
                                            text="View in browser"
                                            onClick={openExternalFunc} />
                                        <ShareMenuItem title={track.title}
                                                       permalink={track.permalink_url}
                                                       username={user.username} />
                                    </Menu>
                                )} position={Position.BOTTOM_LEFT}>
                                    <a href="javascript:void(0)" className="c_btn round">
                                        <i className="icon-more_horiz" />
                                    </a>
                                </Popover>
                            </div>
                        </Col>

                    </Row>
                    <div className="flex tracktabs row">
                        {
                            hasDesc ?
                                (
                                    <a href="javascript:void(0)"
                                       className={cn({ active: this.state.activeTab === '1' })}
                                       onClick={() => this.toggle('1')}>
                                        Info
                                    </a>
                                ) : null
                        }

                        <a href="javascript:void(0)"
                           className={cn({ active: this.state.activeTab === '2', playing: playlist_playing })}
                           onClick={() => this.toggle('2')}>
                            Related tracks
                            {playlist_playing ? <i className="icon-volume_up up blink" /> : null}

                        </a>
                        <a href="javascript:void(0)" className={cn({ active: this.state.activeTab === '3' })}
                           onClick={() => {
                               this.toggle('3')
                           }}>
                            <span className="text">Comments</span>
                            <span className="badge badge-pill badge-primary">{track.comment_count}</span>
                        </a>
                    </div>

                    <Row className="main_track_content">
                        <Col xs="12" className="col-lg user_card_wrap trackMain">
                            <UserCard
                                toggleFollowingFunc={toggleFollowingFunc}
                                user={user}
                                followings={followings}
                            />
                        </Col>
                        <Col xs="12" className="trackMain col-lg">

                            <TabContent activeTab={this.state.activeTab}>
                                {
                                    hasDesc ? (
                                        <TabPane tabId="1">
                                            <div
                                                className={cn('trackDescription', { isOpen: this.state.open })}>

                                                <Linkify text={track.description} router={this.props.router} />

                                            </div>
                                        </TabPane>
                                    ) : null
                                }
                                <TabPane tabId="2">
                                    <TrackList
                                        items={tracks}
                                        hideFirstTrack={true}
                                        player={player}
                                        playingTrack={playingTrack}
                                        likes={likes}
                                        reposts={reposts}

                                        playTrackFunc={playTrackFunc}
                                        likeFunc={toggleLike}
                                        toggleRepost={toggleRepost}
                                        addUpNext={addUpNext}
                                        show={show} />
                                </TabPane>
                                <TabPane tabId="3">
                                    <CommentList
                                        comments={track_comments}
                                        user_entities={user_entities}
                                        comment_entities={comment_entities} />
                                </TabPane>
                            </TabContent>

                        </Col>
                    </Row>
                </div>
            </CustomScroll>
        )
    }
}

TrackPage.defaultProps = {
    track_comments: {},
    playlist: {
        items: []
    }
}

const mapStateToProps = (state, props) => {
    const { location } = props
    const { songId } = props.match.params
    const { entities, player, objects, auth, ui } = state
    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}
    const comment_objects = objects[OBJECT_TYPES.COMMENTS] || {}

    const object_id = songId + RELATED_PLAYLIST_SUFFIX
    const playlist_object = playlist_objects[object_id]

    let denormalized = []

    if (playlist_object) {
        denormalized = denormalize(playlist_object.items, new schema.Array(trackSchema), entities)
    }

    return {
        entities,
        playlist_objects,
        player,
        object_id,
        auth,
        tracks: denormalized,
        comments: comment_objects,
        track_comments: comment_objects[songId],
        params: props.match.params,
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, actions)(TrackPage))
