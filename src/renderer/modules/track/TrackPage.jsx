/* eslint-disable react/no-this-in-sfc */
import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import moment from 'moment';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import * as actions from '../../../shared/actions';
import { downloadFile, openExternal } from '../../../shared/actions/app/window.actions';
import { IMAGE_SIZES, OBJECT_TYPES, RELATED_PLAYLIST_SUFFIX } from '../../../shared/constants';
import trackSchema from '../../../shared/schemas/track';
import { abbreviate_number, isCurrentPlaylistPlaying, SC } from '../../../shared/utils';
import Header from '../app/components/Header/Header';
import CommentList from '../_shared/CommentList/CommentList';
import CustomScroll from '../_shared/CustomScroll';
import FallbackImage from '../_shared/FallbackImage';
import Linkify from '../_shared/Linkify';
import PageHeader from '../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../_shared/ShareMenuItem';
import Spinner from '../_shared/Spinner/Spinner';
import ToggleMore from '../_shared/ToggleMore';
import TogglePlay from '../_shared/TogglePlayButton';
import TrackList from '../_shared/TrackList/TrackList';
import TrackGridUser from '../_shared/TracksGrid/TrackGridUser';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import './track.scss';

class TrackPage extends WithHeaderComponent {

    state = {
        activeTab: '1',
        scrollTop: 0
    }

    componentDidMount() {
        super.componentDidMount()

        const { fetchTrackIfNeeded, params: { songId } } = this.props

        fetchTrackIfNeeded(songId)

    }

    componentWillReceiveProps(nextProps) {
        const { fetchTrackIfNeeded, params: { songId } } = nextProps

        // if (songId !== nextProps.params.songId) {
        fetchTrackIfNeeded(songId)
        // }
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    toggleRepost = (trackID, e) => {
        e.preventDefault()

        this.props.toggleRepost(trackID)
    }

    fetchMore = () => {
        const { params: { songId }, fetchMore } = this.props

        if (this.state.activeTab === '1') {
            fetchMore(songId, OBJECT_TYPES.COMMENTS)
        }
    }

    canFetchMore = () => {
        const { params: { songId }, canFetchMoreOf } = this.props

        if (this.state.activeTab === '1') {
            canFetchMoreOf(songId, OBJECT_TYPES.COMMENTS)
        }

        return false
    }

    renderToggleButton = () => {
        const { params: { songId }, playTrack, object_id, player: { playingTrack } } = this.props

        if (playingTrack.id !== null && (playingTrack.id === +songId)) {
            return <TogglePlay className="c_btn round playButton" />
        }

        const playTrackFunc = playTrack.bind(null, object_id, +songId, null)

        const icon = (playingTrack.id === songId) ? 'pause' : 'play_arrow'

        return (

            <a href="javascript:void(0)" className="c_btn round playButton" onClick={playTrackFunc}>
                <i className={`icon-${icon}`} />
            </a>
        )
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

        if (!track || (track && track.loading)) {
            return <Spinner contained />
        }

        const user = user_entities[track.user_id]
        track.user = user;

        const liked = SC.hasID(track.id, likes.track)
        const reposted = SC.hasID(track.id, reposts)
        const following = SC.hasID(track.user_id, followings)

        const openExternalFunc = openExternal.bind(null, track.permalink_url)
        const toggleFollowingFunc = toggleFollowing.bind(null, track.user_id)
        const playTrackFunc = playTrack.bind(null, object_id)

        const playlist_playing = isCurrentPlaylistPlaying(player, object_id)

        const tags = track.tag_list.split(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g).reduce((all, obj) => {
            if (obj && obj !== '"') {
                all.push(obj.replace(/"/g, ''))
            }

            return all
        }, [])

        const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE);

        return (
            <CustomScroll className="column" heightRelativeToParent="100%"
                allowOuterScroll
                threshold={300}
                ref={r => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                loadMore={this.fetchMore.bind(this)}
                hasMore={this.canFetchMore()}>

                <Header className="withImage" scrollTop={this.state.scrollTop} />

                <PageHeader image={image}>
                    <Row className="trackHeader">
                        <Col xs="12" md="4" xl="3">
                            <div className="imageWrapper">
                                <FallbackImage
                                    src={image}
                                    id={track.id} />
                            </div>
                        </Col>

                        <Col xs="12" md="8" xl="" className="trackInfo text-md-left text-xs-center">
                            <h2>{track.title}</h2>

                            <div className="button-group">
                                {
                                    (track.streamable || (track.policy && track.policy === "ALLOW")) || track.kind === 'playlist' ? this.renderToggleButton() :
                                        <a href="javascript:void(0)" className="disabled c_btn">
                                            <span>This track is not streamable</span>
                                        </a>
                                }

                                <a href="javascript:void(0)" className={cn('c_btn', { liked })}
                                    onClick={toggleLike.bind(this, track.id, false)}>
                                    <i className={liked ? 'bx bxs-heart' : 'bx bx-heart'} />
                                    <span>{liked ? 'Liked' : 'Like'}</span>
                                </a>


                                <a href="javascript:void(0)" className={cn('c_btn', { liked: reposted })}
                                    onClick={toggleRepost.bind(null, track.id)}>
                                    <i className='bx bx-repost' />
                                    <span>{reposted ? 'Reposted' : 'Repost'}</span>
                                </a>


                                {
                                    !track.purchase_url && track.download_url && track.downloadable && (
                                        <a href="javascript:void(0)" className="c_btn round"
                                            onClick={downloadFile.bind(null, SC.appendClientId(track.download_url))}>
                                            <i className='bx bxs-download-alt' />
                                        </a>
                                    )
                                }

                                <Popover autoFocus={false} minimal content={(
                                    <Menu>

                                        {
                                            track.purchase_url && (
                                                <React.Fragment>
                                                    {
                                                        track.purchase_url && (
                                                            <MenuItem icon="link"
                                                                text={track.purchase_title || 'Download'}
                                                                onClick={openExternal.bind(null, track.purchase_url)} />
                                                        )
                                                    }


                                                    <MenuDivider />
                                                </React.Fragment>
                                            )
                                        }

                                        <MenuItem text="Add to playlist"
                                            onClick={show.bind(null, 'addToPlaylist', { trackID: track.id })} />
                                        <MenuItem text="Add to queue"
                                            onClick={addUpNext.bind(null, track, null)} />
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
                        <a href="javascript:void(0)"
                            className={cn({ active: this.state.activeTab === '1' })}
                            onClick={() => this.toggle('1')}>
                            Overview
                        </a>

                        <a href="javascript:void(0)"
                            className={cn({ active: this.state.activeTab === '2', playing: playlist_playing })}
                            onClick={() => this.toggle('2')}>
                            Related tracks
                        </a>
                    </div>
                </PageHeader>

                <div className="trackDetails container-fluid main_track_content detailPage">
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1" className="overview">
                            <Row>
                                <Col xs="12" lg="3">
                                    <Row>
                                        <Col xs="6" lg="12">
                                            <TrackGridUser following={following} user={user}
                                                toggleFollowingFunc={toggleFollowingFunc} />
                                        </Col>

                                        <Col xs="6" lg="12">
                                            <div className="p-3 track-info">
                                                <strong>Created</strong>
                                                <div>{moment(new Date(track.created_at)).fromNow()}</div>

                                                {
                                                    track.label_name && (
                                                        <React.Fragment>
                                                            <strong>Label</strong>
                                                            <div>{track.label_name}</div>
                                                        </React.Fragment>
                                                    )
                                                }

                                            </div>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col xs="12" className="trackPadding col-lg">
                                    <div className="flex stats align-items-center justify-content-between">
                                        <div
                                            className="taglist">
                                            {tags.map(tag => (
                                                <span key={tag} className="badge badge-secondary">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className='bx bxs-heart' />

                                            <span>{abbreviate_number(track.likes_count || track.favoritings_count)}</span>

                                            <i className='bx bx-play' />
                                            <span>{abbreviate_number(track.playback_count)}</span>

                                            <i className='bx bx-repost' />
                                            <span>{abbreviate_number(track.reposts_count)}</span>

                                        </div>
                                    </div>
                                    {
                                        track.description && (
                                            <ToggleMore className="trackDescription">
                                                <Linkify text={track.description} router={this.props.router} />
                                            </ToggleMore>
                                        )
                                    }


                                    <CommentList
                                        comments={track_comments}
                                        user_entities={user_entities}
                                        comment_entities={comment_entities} />
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="2" className="trackPadding-side">
                            <TrackList
                                items={tracks}
                                hideFirstTrack
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
                    </TabContent>

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
    const { location, history } = props
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
