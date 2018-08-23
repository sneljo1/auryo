/* eslint-disable react/no-this-in-sfc */
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import * as actions from '../../../shared/actions';
import { openExternal } from '../../../shared/actions/app/window.actions';
import { IMAGE_SIZES, OBJECT_TYPES, USER_LIKES_SUFFIX, USER_TRACKS_PLAYLIST_SUFFIX } from '../../../shared/constants';
import trackSchema from '../../../shared/schemas/track';
import { abbreviate_number, SC } from '../../../shared/utils';
import Header from '../app/components/Header/Header';
import { PLAYER_STATUS } from '../../../shared/constants/player';
import CustomScroll from '../_shared/CustomScroll';
import FallbackImage from '../_shared/FallbackImage';
import Linkify from '../_shared/Linkify';
import PageHeader from '../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../_shared/ShareMenuItem';
import Spinner from '../_shared/Spinner/Spinner';
import ToggleMoreComponent from '../_shared/ToggleMore';
import TrackList from '../_shared/TrackList/TrackList';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import ArtistProfiles from './components/ArtistProfiles/ArtistProfiles';
import './index.scss';

class ArtistPage extends WithHeaderComponent {

    state = {
        activeTab: '1',
        small: false,
        scrollTop: 0
    }

    componentDidMount() {
        super.componentDidMount()

        const { fetchArtistIfNeeded, params: { artistId } } = this.props

        fetchArtistIfNeeded(artistId)
    }

    componentWillReceiveProps(nextProps) {
        const { fetchArtistIfNeeded, params: { artistId }, app: { dimensions } } = nextProps

        fetchArtistIfNeeded(artistId)


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

    renderPlaylist = (playlist_name) => {
        const { playlist_objects, auth, player, params, playingTrack, playTrack, toggleRepost, show, addUpNext, toggleLike, items } = this.props
        const { artistId } = params
        const { likes, reposts } = auth

        const object_id = artistId + playlist_name
        const playlist = playlist_objects[object_id] || {}

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
                    playTrackFunc={playTrack.bind(null, object_id)}
                    show={show}
                />
                {playlist.isFetching ? <Spinner /> : null}
            </div>

        )
    }

    renderPlayButton = () => {
        const {
            player,
            playTrack,
            toggleStatus,
            params,
            items
        } = this.props

        const { artistId } = params

        const playlistId = artistId + USER_TRACKS_PLAYLIST_SUFFIX

        const playlistItems = items[playlistId]

        if (!playlistItems.length) return null

        const first_id = playlistItems[0].id

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
        const { entities, params: { artistId }, auth } = this.props
        const { user_entities } = entities
        const { followings, me } = auth
        const { small } = this.state

        const user = user_entities[artistId]

        if (!user || (user && user.loading) || user.track_count === null) return <Spinner />

        const user_img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.LARGE)
        const following = SC.hasID(user.id, followings)

        const openExternalFunc = openExternal.bind(null, user.permalink_url)

        return (
            <CustomScroll className="column" heightRelativeToParent="100%"
                allowOuterScroll
                heightMargin={35}
                onScroll={this.debouncedOnScroll}
                threshold={300}
                loadMore={this.fetchMore.bind(this)}
                hasMore={this.canFetchMore()}>
                <Header className="withImage" scrollTop={this.state.scrollTop} />

                <PageHeader image={user_img}>
                    <Row className="trackHeader">
                        <Col xs="12" md="4" xl="2">
                            <div className="imageWrapper">
                                <FallbackImage
                                    src={user_img}
                                    id={user.id} />
                            </div>
                        </Col>

                        <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
                            <Row className='justify-content-md-between'>
                                <Col xs='12' md='6'>
                                    <h2>{user.username}</h2>
                                    <h3 className='trackArtist'>{user.city}{user.city && user.country ? ' , ' : null}{user.country}</h3>
                                    <div className="button-group">
                                        {
                                            this.renderPlayButton()
                                        }
                                        {
                                            artistId !== me.id ? <a href='javascript:void(0)'
                                                className={cn('c_btn', { following })}
                                                onClick={this.toggleFollow.bind(this)}>
                                                {following ? <i className='icon-check' /> : <i className='icon-add' />}
                                                <span>{following ? 'Following' : 'Follow'}</span>
                                            </a> : null
                                        }

                                        <Popover autoFocus={false} minimal content={(
                                            <Menu>
                                                <MenuItem
                                                    text="View in browser"
                                                    onClick={openExternalFunc} />
                                                <ShareMenuItem username={user.username}
                                                    permalink={user.permalink_url} />
                                            </Menu>
                                        )} position={Position.BOTTOM_LEFT}>
                                            <a href="javascript:void(0)" className="c_btn round">
                                                <i className="icon-more_horiz" />
                                            </a>
                                        </Popover>
                                    </div>
                                </Col>

                                <Col xs='12' md=''>
                                    <ul className='artistStats d-flex justify-content-start justify-content-lg-end'>
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
                                </Col>
                            </Row>
                        </Col>

                    </Row>


                    <div className="flex tracktabs row">
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
                </PageHeader>
                <div className='artistPage container-fluid detailPage'>
                    <Row className="main_track_content">
                        <Col xs='12' lg='8'>

                            <TabContent activeTab={this.state.activeTab} className="px-4">
                                <TabPane tabId='1'>
                                    {this.renderPlaylist(USER_TRACKS_PLAYLIST_SUFFIX)}
                                </TabPane>
                                <TabPane tabId='2'>
                                    {this.renderPlaylist(USER_LIKES_SUFFIX)}
                                </TabPane>
                                {
                                    small ? (
                                        <TabPane tabId='3'>
                                            <div className='artistInfo p-1  pt-5'>
                                                <Linkify text={user.description} router={this.props.router} />
                                            </div>
                                            <ArtistProfiles className='pt-1' profiles={user.profiles} />
                                        </TabPane>
                                    ) : null
                                }
                            </TabContent>

                        </Col>
                        {
                            !small ? (
                                <Col xs='4' className='artistSide'>

                                    <ToggleMoreComponent>
                                        <div className='artistInfo'>
                                            <Linkify text={user.description} router={this.props.router} />
                                        </div>
                                    </ToggleMoreComponent>

                                    <ArtistProfiles profiles={user.profiles} />
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
    const { match: { params: { artistId } }, history, location } = props

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

export default withRouter(connect(mapStateToProps, actions)(ArtistPage))