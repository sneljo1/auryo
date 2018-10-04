import { Menu, MenuDivider, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import { bindActionCreators, Dispatch } from 'redux';
import { IMAGE_SIZES, RELATED_PLAYLIST_SUFFIX } from '../../../shared/constants';
import { commentSchema, playlistSchema } from '../../../shared/schemas';
import trackSchema from '../../../shared/schemas/track';
import { StoreState } from '../../../shared/store';
import { AuthState, toggleFollowing } from '../../../shared/store/auth';
import { canFetchMoreOf, EntitiesState, fetchMore, ObjectState, ObjectTypes } from '../../../shared/store/objects';
import { addUpNext, PlayerState, playTrack } from '../../../shared/store/player';
import { togglePlaylistTrack } from '../../../shared/store/playlist/playlist';
import { fetchTrackIfNeeded, toggleLike, toggleRepost } from '../../../shared/store/track/actions';
import { setScrollPosition } from '../../../shared/store/ui';
import { isCurrentPlaylistPlaying, SC } from '../../../shared/utils';
import { IPC } from '../../../shared/utils/ipc';
import { SoundCloud } from '../../../types';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import FallbackImage from '../_shared/FallbackImage';
import PageHeader from '../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../_shared/ShareMenuItem';
import Spinner from '../_shared/Spinner/Spinner';
import TogglePlay from '../_shared/TogglePlayButton';
import TrackList from '../_shared/TrackList/TrackList';
import WithHeaderComponent from '../_shared/WithHeaderComponent';
import TrackOverview from './components/TrackOverview';

interface OwnProps extends RouteComponentProps<{ songId: string }> {
}

interface PropsFromState {
    entities: EntitiesState;
    player: PlayerState;
    relatedPlaylistId: string;
    auth: AuthState;
    relatedTracks: ObjectState<SoundCloud.Track> | null;
    comments: ObjectState<SoundCloud.Comment> | null;
    previousScrollTop?: number;
    track: SoundCloud.Track | null;
    songIdParam: number;
    userPlaylists: SoundCloud.Playlist[]
}

interface PropsFromDispatch {
    setScrollPosition: typeof setScrollPosition;
    fetchTrackIfNeeded: typeof fetchTrackIfNeeded;
    toggleRepost: typeof toggleRepost;
    fetchMore: typeof fetchMore;
    canFetchMoreOf: typeof canFetchMoreOf;
    playTrack: typeof playTrack;
    toggleFollowing: typeof toggleFollowing;
    addUpNext: typeof addUpNext;
    toggleLike: typeof toggleLike;
    togglePlaylistTrack: typeof togglePlaylistTrack;
}

interface State {
    activeTab: TabTypes;
    scrollTop: number;
}

enum TabTypes {
    OVERVIEW = 'overview',
    RELATED_TRACKS = 'related'
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackPage extends WithHeaderComponent<AllProps, State> {

    state: State = {
        activeTab: TabTypes.OVERVIEW,
        scrollTop: 0
    };

    componentDidMount() {
        super.componentDidMount();

        const { fetchTrackIfNeeded, songIdParam } = this.props;

        fetchTrackIfNeeded(songIdParam);

    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { fetchTrackIfNeeded, songIdParam } = nextProps;

        // if (songId !== nextProps.params.songId) {
        fetchTrackIfNeeded(songIdParam);
        // }
    }

    toggle = (tab: TabTypes) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    fetchMore = () => {
        const { match: { params: { songId } }, fetchMore } = this.props;

        if (this.state.activeTab === TabTypes.OVERVIEW) {
            fetchMore(songId, ObjectTypes.COMMENTS);
        }
    }

    canFetchMore = () => {
        const { match: { params: { songId } }, canFetchMoreOf } = this.props;

        if (this.state.activeTab === TabTypes.OVERVIEW) {
            canFetchMoreOf(songId, ObjectTypes.COMMENTS);
        }

        return false;
    }

    renderToggleButton = () => {
        const { songIdParam, playTrack, relatedPlaylistId, player: { playingTrack } } = this.props;

        // TODO redundant?

        if (playingTrack && playingTrack.id !== null && (playingTrack.id === songIdParam)) {
            return <TogglePlay className='c_btn round playButton' />;
        }

        const playTrackFunc = () => {
            playTrack(relatedPlaylistId, { id: songIdParam });
        };

        // const icon = (playingTrack.id === songId) ? 'pause' : 'play_arrow'

        return (
            <a href='javascript:void(0)' className='c_btn round playButton' onClick={playTrackFunc}>
                <i className={`icon-play_arrow`} />
            </a>
        );
    }

    render() {
        const {
            // Vars
            auth: { likes, followings, reposts },
            player,
            relatedPlaylistId,
            comments,
            relatedTracks,
            track,

            // Functions
            toggleFollowing,
            playTrack,
            userPlaylists,
            toggleLike,
            toggleRepost,
            addUpNext
        } = this.props;

        if (!track || (track && track.loading)) {
            return <Spinner contained={true} />;
        }

        const liked = SC.hasID(track.id, likes.track);
        const reposted = SC.hasID(track.id, reposts);
        const following = SC.hasID(track.user_id, followings);

        const playlistPlaying = isCurrentPlaylistPlaying(player, relatedPlaylistId);

        const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE);

        return (
            <CustomScroll
                className='column withHeader'
                heightRelativeToParent='100%'
                allowOuterScroll={true}
                threshold={300}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                loadMore={this.fetchMore}
                hasMore={this.canFetchMore}
            >

                <Header
                    className='withImage'
                    scrollTop={this.state.scrollTop}
                />

                <PageHeader image={image}>
                    <Row className='trackHeader'>
                        <Col xs='12' md='4' xl='3'>
                            <div className='imageWrapper'>
                                <FallbackImage
                                    src={image}
                                    id={track.id}
                                />
                            </div>
                        </Col>

                        <Col xs='12' md='8' xl='' className='trackInfo text-md-left text-xs-center'>
                            <h2>{track.title}</h2>

                            <div className='button-group'>
                                {
                                    (track.streamable || (track.policy && track.policy === 'ALLOW')) ? this.renderToggleButton() :
                                        <a href='javascript:void(0)' className='disabled c_btn'>
                                            <span>This track is not streamable</span>
                                        </a>
                                }

                                <a href='javascript:void(0)' className={cn('c_btn', { liked })}
                                    onClick={() => {
                                        toggleLike(track.id);
                                    }}>
                                    <i className={liked ? 'bx bxs-heart' : 'bx bx-heart'} />
                                    <span>{liked ? 'Liked' : 'Like'}</span>
                                </a>


                                <a href='javascript:void(0)' className={cn('c_btn', { liked: reposted })}
                                    onClick={() => {
                                        toggleRepost(track.id);
                                    }}>
                                    <i className='bx bx-repost' />
                                    <span>{reposted ? 'Reposted' : 'Repost'}</span>
                                </a>


                                {
                                    !track.purchase_url && track.download_url && track.downloadable && (
                                        <a href='javascript:void(0)' className='c_btn round'
                                            onClick={() => {
                                                IPC.downloadFile(SC.appendClientId(track.download_url));
                                            }}>
                                            <i className='bx bxs-download-alt' />
                                        </a>
                                    )
                                }

                                <Popover autoFocus={false} minimal={true} content={(
                                    <Menu>

                                        {
                                            track.purchase_url && (
                                                <React.Fragment>
                                                    {
                                                        track.purchase_url && (
                                                            <MenuItem icon='link'
                                                                text={track.purchase_title || 'Download'}
                                                                onClick={() => {
                                                                    IPC.openExternal(track.purchase_url);
                                                                }} />
                                                        )
                                                    }

                                                    <MenuDivider />
                                                </React.Fragment>
                                            )
                                        }

                                        <MenuItem text="Add to playlist">
                                            {
                                                userPlaylists.map(playlist => {
                                                    const inPlaylist = !!playlist.tracks.find(t => t.id === track.id)

                                                    return (
                                                        <MenuItem
                                                            key={`menu-item-add-to-playlist-${playlist.id}`}
                                                            className={cn({ 'text-primary': inPlaylist })}
                                                            onClick={() => {
                                                                togglePlaylistTrack(track.id, playlist.id)
                                                            }}
                                                            text={playlist.title} />
                                                    )
                                                })
                                            }
                                        </MenuItem>

                                        <MenuItem text='Add to queue'
                                            onClick={() => {
                                                addUpNext(track);
                                            }} />

                                        <MenuDivider />

                                        <MenuItem
                                            text='View in browser'
                                            onClick={() => {
                                                IPC.openExternal(track.permalink_url);
                                            }} />

                                        <ShareMenuItem title={track.title}
                                            permalink={track.permalink_url}
                                            username={track.user.username} />
                                    </Menu>
                                )}
                                    position={Position.BOTTOM_LEFT}>
                                    <a href='javascript:void(0)' className='c_btn round'>
                                        <i className='icon-more_horiz' />
                                    </a>
                                </Popover>
                            </div>
                        </Col>

                    </Row>


                    <div className='flex tracktabs row'>
                        <a
                            href='javascript:void(0)'
                            className={cn({ active: this.state.activeTab === TabTypes.OVERVIEW })}
                            onClick={() => this.toggle(TabTypes.OVERVIEW)}
                        >
                            Overview
                        </a>

                        <a
                            href='javascript:void(0)'
                            className={cn({ active: this.state.activeTab === TabTypes.RELATED_TRACKS, playing: playlistPlaying })}
                            onClick={() => this.toggle(TabTypes.RELATED_TRACKS)}
                        >
                            Related tracks
                        </a>
                    </div>

                </PageHeader>

                <div className='trackDetails container-fluid main_track_content detailPage'>
                    <TabContent activeTab={this.state.activeTab}>

                        {/* OVERVIEW */}
                        <TabPane tabId={TabTypes.OVERVIEW} className='overview'>
                            <TrackOverview
                                track={track}
                                following={following}
                                toggleFollowing={toggleFollowing}
                                comments={comments}
                            />
                        </TabPane>

                        {/* RELATED TRACKS */}
                        {/* TODO ADD Spinner */}
                        <TabPane tabId={TabTypes.RELATED_TRACKS} className='trackPadding-side'>
                            {
                                (relatedTracks && this.state.activeTab === TabTypes.RELATED_TRACKS) && (
                                    <TrackList
                                        objectId={relatedPlaylistId}
                                        items={relatedTracks.items}
                                        hideFirstTrack={true}
                                        playingTrack={player.playingTrack}

                                        playTrack={playTrack}
                                    />
                                )
                            }
                        </TabPane>
                    </TabContent>

                </div>
            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { location, history } = props;
    const { songId } = props.match.params;
    const { entities, player, objects, auth, ui } = state;

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};
    const commentObjects = objects[ObjectTypes.COMMENTS] || {};

    const relatedPlaylistId = songId + RELATED_PLAYLIST_SUFFIX;
    const relatedTracksObject = playlistObjects[relatedPlaylistId];
    const commentsObject = commentObjects[songId];

    let dRelatedTracksObject: ObjectState<SoundCloud.Track> | null = null;


    if (relatedTracksObject) {
        dRelatedTracksObject = denormalize(relatedTracksObject, new schema.Object({
            items: new schema.Array({
                tracks: trackSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    let dcommentsObject: ObjectState<SoundCloud.Comment> | null = null;

    if (commentsObject) {
        dcommentsObject = denormalize(commentsObject, new schema.Object({
            items: new schema.Array({
                comments: commentSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    const userPlaylists = denormalize(auth.playlists, new schema.Array({ playlists: playlistSchema }, (input) => `${input.kind}s`), entities);

    const track = denormalize(songId, trackSchema, entities);


    return {
        entities,
        player,
        relatedPlaylistId,
        auth,
        track,
        userPlaylists,
        songIdParam: +songId,
        relatedTracks: dRelatedTracksObject,
        comments: dcommentsObject,
        previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    setScrollPosition,
    fetchTrackIfNeeded,
    toggleRepost,
    fetchMore,
    canFetchMoreOf,
    playTrack,
    toggleFollowing,
    addUpNext,
    toggleLike,
    togglePlaylistTrack
}, dispatch);

export default withRouter(connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TrackPage));
