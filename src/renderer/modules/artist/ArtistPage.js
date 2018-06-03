import React from 'react'
import { connect } from 'react-redux'
import { Col, Row, TabContent, TabPane } from 'reactstrap'
import cn from 'classnames'
import * as actions from '../../../shared/actions/index'
import { abbreviate_number, SC } from '../../../shared/utils/index'
import {
    IMAGE_SIZES,
    OBJECT_TYPES,
    USER_LIKES_SUFFIX,
    USER_TRACKS_PLAYLIST_SUFFIX
} from '../../../shared/constants/index'
import TrackList from '../_shared/TrackList/trackList.component'
import Spinner from '../_shared/Spinner/spinner.component'
import FallbackImage from '../_shared/FallbackImage'
import ToggleMoreComponent from '../_shared/toggleMore.component'
import ArtistProfiles from './components/ArtistProfiles/artistProfiles.component'
import MoreActionsDropdown from '../_shared/moreActionsDropdown.component'
import './index.scss'
import { openExternal } from '../../../shared/actions/app/window.actions'
import { withRouter } from 'react-router'
import Linkify from '../_shared/linkify.component'
import CustomScroll from '../_shared/CustomScroll'
import { denormalize, schema } from 'normalizr'
import trackSchema from '../../../shared/schemas/track'
import debounce from 'lodash/debounce'

class ArtistContainer extends React.Component {

    state = {
        activeTab: '1',
        small: false
    }

    componentDidMount() {
        const { fetchArtistIfNeeded, params: { artistId } } = this.props

        fetchArtistIfNeeded(artistId)

        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

        this.debouncedSetScroll = debounce(this.props.setScrollPosition, 10)
    }

    componentWillReceiveProps(nextProps) {
        const { fetchArtistIfNeeded, params: { artistId } } = this.props

        if (artistId !== nextProps.params.artistId) {
            fetchArtistIfNeeded(nextProps.params.artistId)

        }
    }

    componentWillUpdate(nextProps) {
        const { app: { dimensions } } = nextProps

        if (this.state.small !== dimensions.width < 990) {
            this.setState({
                small: dimensions.width < 990
            })
        }

        if (dimensions.width > 768 && this.state.activeTab === '3') {
            this.setState({
                activeTab: '2'
            })
        }
    }


    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    toggleFollow = () => {
        const { toggleFollowing, params: { artistId } } = this.props

        toggleFollowing(artistId)
    }

    renderPlaylist = (playlist_name) => {
        const { playlist_objects, auth, player, params, playingTrack, playTrack, toggleRepost, show, addUpNext, toggleLike, items } = this.props
        const { artistId } = params
        const { likes, reposts } = auth

        const object_id = artistId + playlist_name
        const playlist = playlist_objects[playlist_name] || {}

        return (
            <div>
                <TrackList
                    items={items[object_id]}

                    likes={likes}
                    reposts={reposts}
                    player={player}
                    playingTrack={playingTrack}

                    addUpNext={addUpNext}
                    likeFunc={(trackId => toggleLike(trackId, false))}
                    toggleRepost={toggleRepost}
                    playTrackFunc={playTrack.bind(null, playlist_name)}
                    show={show}
                />
                {playlist.isFetching ? <Spinner full /> : null}
            </div>

        )
    }

    fetchMore = () => {
        const { params: { artistId }, fetchMore } = this.props
        let playlist_name = null

        if (this.state.activeTab === '1') {
            playlist_name = artistId + USER_TRACKS_PLAYLIST_SUFFIX
        } else if (this.state.activeTab === '2') {
            playlist_name = artistId + USER_LIKES_SUFFIX
        }

        if (playlist_name) {
            fetchMore(playlist_name, OBJECT_TYPES.PLAYLISTS)
        }
    }

    canFetchMore = () => {
        const { params: { artistId }, canFetchMoreOf } = this.props
        let playlist_name = null

        if (this.state.activeTab === '1') {
            playlist_name = artistId + USER_TRACKS_PLAYLIST_SUFFIX
        } else if (this.state.activeTab === '2') {
            playlist_name = artistId + USER_LIKES_SUFFIX
        }

        if (playlist_name) {
            canFetchMoreOf(playlist_name, OBJECT_TYPES.PLAYLISTS)
        }
    }


    render() {
        const { entities, params: { artistId }, auth } = this.props
        const { user_entities } = entities
        const { followings, me } = auth
        const { small } = this.state

        const user = user_entities[artistId]

        if (!user || user.track_count === null) return <Spinner />

        const user_img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.LARGE)
        const following = SC.hasID(user.id, followings)

        const openExternalFunc = openExternal.bind(null, user.permalink_url)

        return (
            <CustomScroll heightRelativeToParent="100%"
                          allowOuterScroll={true}
                          onScroll={this.debouncedSetScroll}
                          threshold={300}
                          loadMore={this.fetchMore.bind(this)}
                          hasMore={this.canFetchMore()}>
                <div className='artistPage container-fluid'>
                    <Row className='trackHeader row'>

                        <div className='overlayWrapper'>
                            <FallbackImage
                                overflow
                                id={user.id}
                                className='overlayImg'
                                src={user_img} />
                        </div>

                        <Col xs='12' md='4' xl='2'>
                            <div className='imageWrapper'>
                                <FallbackImage
                                    overflow
                                    id={user.id}
                                    src={user_img} />

                                <FallbackImage
                                    overflow
                                    id={user.id}
                                    className='imgShadow'
                                    src={user_img} />
                            </div>
                        </Col>

                        <Col xs='12' md='8' xl='10' className='trackInfo text-md-left text-xs-center'>

                            <Row className='justify-content-md-between'>
                                <Col xs='12' md='6'>
                                    <h1 className='trackTitle'>{user.username}</h1>
                                    <h2 className='trackArtist'>{user.city}{user.city && user.country ? ' , ' : null}{user.country}</h2>
                                </Col>

                                <Col xs='12' md='' className='col-md text-xs-right'>
                                    <ul className='artistStats d-flex justify-content-center justify-content-md-end'>
                                        <li>
                                            <span>{abbreviate_number(user.followers_count)}</span>
                                            <span>Followers</span>
                                        </li>
                                        <li>
                                            <span>{abbreviate_number(user.followings_count)}</span>
                                            <span>Following</span>
                                        </li>
                                        <li>
                                            <span>{abbreviate_number(user.track_count)}</span>
                                            <span>Tracks</span>
                                        </li>
                                    </ul>
                                    <div
                                        className='flex trackActions flex-wrap justify-content-center justify-content-md-end'>
                                        {
                                            artistId !== me.id ? <a href='javascript:void(0)'
                                                                    className={cn('c_btn', { following: following })}
                                                                    onClick={this.toggleFollow.bind(this)}>
                                                {following ? <i className='icon-check' /> : <i className='icon-add' />}
                                                <span>{following ? 'Following' : 'Follow'}</span>
                                            </a> : null
                                        }

                                        <MoreActionsDropdown>
                                            <a className='dropdown-item'
                                               onClick={openExternalFunc}>
                                                View in browser
                                            </a>
                                        </MoreActionsDropdown>
                                    </div>
                                </Col>
                            </Row>

                        </Col>

                    </Row>
                    <div className='d-flex tracktabs row'>
                        <a href='javascript:void(0)' className={cn({ active: this.state.activeTab === '1' })}
                           onClick={() => {
                               this.toggle('1')
                           }}>
                            <span className='text'>Tracks</span>
                        </a>
                        <a href='javascript:void(0)' className={cn({ active: this.state.activeTab === '2' })}
                           onClick={() => {
                               this.toggle('2')
                           }}>
                            <span className='text'>Likes</span>
                        </a>
                        {
                            small ?
                                <a href='javascript:void(0)' className={cn({ active: this.state.activeTab === '3' })}
                                   onClick={() => {
                                       this.toggle('3')
                                   }}>
                                    <span className='text'>Info</span>
                                </a> : null
                        }
                    </div>
                    <Row className="main_track_content">
                        <Col xs='12' lg='9'>

                            <TabContent activeTab={this.state.activeTab}>
                                <TabPane tabId='1'>
                                    {this.renderPlaylist(USER_TRACKS_PLAYLIST_SUFFIX)}
                                </TabPane>
                                <TabPane tabId='2'>
                                    {this.renderPlaylist(USER_LIKES_SUFFIX)}
                                </TabPane>
                                {
                                    small ? (
                                        <TabPane tabId='3'>
                                            <ArtistProfiles className='pt-1' profiles={user.profiles} />

                                            <div className='artistInfo p-1 pt-0'>
                                                <Linkify text={user.description} router={this.props.router} />

                                            </div>
                                        </TabPane>
                                    ) : null
                                }
                            </TabContent>

                        </Col>
                        {
                            !small ? (
                                <Col xs='3' className='artistSide'>
                                    <ArtistProfiles profiles={user.profiles} />

                                    <ToggleMoreComponent>
                                        <div className='artistInfo'>
                                            <Linkify text={user.description} router={this.props.router} />
                                        </div>
                                    </ToggleMoreComponent>

                                </Col>
                            ) : null
                        }

                    </Row>
                </div>
            </CustomScroll>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { entities, auth, app, player, objects, ui } = state
    const { location } = props

    const artistId = props.match.params.artistId

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}

    // Denormalize and fetch tracks
    const tracksObject_id = artistId + USER_TRACKS_PLAYLIST_SUFFIX
    const tracksPlaylist_object = playlist_objects[tracksObject_id]

    let denormTracks = []

    if (tracksPlaylist_object) {
        denormTracks = denormalize(tracksPlaylist_object.items, new schema.Array(trackSchema), entities)
    }

    // Denormalize and fetch likes
    const likesObject_id = artistId + USER_LIKES_SUFFIX
    const likesPlaylist_object = playlist_objects[likesObject_id]

    let denormLikes = []

    if (likesPlaylist_object) {
        denormLikes = denormalize(likesPlaylist_object.items, new schema.Array(trackSchema), entities)
    }

    return {
        entities,
        app,
        auth,
        player,
        playlist_objects,
        playingTrack: player.playingTrack,
        params: props.match.params,

        items: {
            [tracksObject_id]: denormTracks,
            [likesObject_id]: denormLikes
        },
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined

    }
}

export default withRouter(connect(mapStateToProps, actions)(ArtistContainer))