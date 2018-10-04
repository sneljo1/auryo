import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import { bindActionCreators, Dispatch } from 'redux';
import { IMAGE_SIZES, USER_LIKES_SUFFIX, USER_TRACKS_PLAYLIST_SUFFIX } from '../../../shared/constants';
import { userSchema } from '../../../shared/schemas';
import trackSchema from '../../../shared/schemas/track';
import { StoreState } from '../../../shared/store';
import { AppState } from '../../../shared/store/app';
import { AuthState, toggleFollowing } from '../../../shared/store/auth';
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes } from '../../../shared/store/objects';
import { PlayerState, PlayerStatus, PlayingTrack, playTrack, toggleStatus } from '../../../shared/store/player';
import { setScrollPosition } from '../../../shared/store/ui';
import { fetchArtistIfNeeded } from '../../../shared/store/user/actions';
import { abbreviate_number, SC } from '../../../shared/utils';
import { IPC } from '../../../shared/utils/ipc';
import { SoundCloud } from '../../../types';
import Header from '../app/components/Header/Header';
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

interface OwnProps extends RouteComponentProps<{ artistId: string }> {
}


enum PlaylistTypes {
    TRACKS = 'TRACKS',
    LIKES = 'LIKRS',
}

interface PropsFromState {
    app: AppState;
    playingTrack: PlayingTrack | null;
    player: PlayerState;
    auth: AuthState;
    user: SoundCloud.User;
    playlists: {
        [PlaylistTypes.LIKES]: ObjectState<SoundCloud.Track> | null,
        [PlaylistTypes.TRACKS]: ObjectState<SoundCloud.Track> | null,
    },
    previousScrollTop?: number;
    artistIdParam: number;
}

interface PropsFromDispatch {
    fetchArtistIfNeeded: typeof fetchArtistIfNeeded;
    setScrollPosition: typeof setScrollPosition;
    toggleFollowing: typeof toggleFollowing;
    fetchMore: typeof fetchMore;
    canFetchMoreOf: typeof canFetchMoreOf;
    playTrack: typeof playTrack;
    toggleStatus: typeof toggleStatus;
}

interface State {
    activeTab: TabTypes;
    small: boolean;
    scrollTop: number;
}

enum TabTypes {
    TRACKS = 'tracks',
    LIKES = 'likes',
    INFO = 'info'
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class ArtistPage extends WithHeaderComponent<AllProps, State> {

    state: State = {
        activeTab: TabTypes.TRACKS,
        small: false,
        scrollTop: 0
    };

    componentDidMount() {
        super.componentDidMount();

        const { fetchArtistIfNeeded, artistIdParam } = this.props;

        fetchArtistIfNeeded(artistIdParam);
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { fetchArtistIfNeeded, artistIdParam, app: { dimensions } } = nextProps;
        const { activeTab } = this.state;

        fetchArtistIfNeeded(artistIdParam);

        if (this.state.small !== dimensions.width < 990) {
            this.setState({
                small: dimensions.width < 990
            });
        }

        if (dimensions.width > 768 && activeTab === TabTypes.INFO) {
            this.setState({
                activeTab: TabTypes.TRACKS
            });
        }

    }

    toggle = (tab: TabTypes) => {
        const { activeTab } = this.state;

        if (activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    toggleFollow = () => {
        const { toggleFollowing, artistIdParam } = this.props;

        toggleFollowing(artistIdParam);
    }

    fetchMore = () => {
        const { match: { params: { artistId } }, fetchMore } = this.props;
        const { activeTab } = this.state;
        let playlist_name = null;

        if (activeTab === TabTypes.TRACKS) {
            playlist_name = artistId + USER_TRACKS_PLAYLIST_SUFFIX;
        } else if (activeTab === TabTypes.LIKES) {
            playlist_name = artistId + USER_LIKES_SUFFIX;
        }

        if (playlist_name) {
            fetchMore(playlist_name, ObjectTypes.PLAYLISTS);
        }
    }

    canFetchMore = () => {
        const { activeTab } = this.state;
        const { match: { params: { artistId } }, canFetchMoreOf } = this.props;
        let playlist_name = null;

        if (activeTab === TabTypes.TRACKS) {
            playlist_name = artistId + USER_TRACKS_PLAYLIST_SUFFIX;
        } else if (activeTab === TabTypes.LIKES) {
            playlist_name = artistId + USER_LIKES_SUFFIX;
        }

        if (playlist_name) {
            canFetchMoreOf(playlist_name, ObjectTypes.PLAYLISTS);
        }
    }

    renderPlaylist = (type: PlaylistTypes) => {
        const {
            player,
            match: { params: { artistId } },
            playTrack,
            playlists
        } = this.props;

        const objectId = artistId + (type === PlaylistTypes.LIKES ? USER_LIKES_SUFFIX : USER_TRACKS_PLAYLIST_SUFFIX);
        const playlist = playlists[type];

        if (!playlist) return <Spinner contained />;

        return (
            <React.Fragment>
                <TrackList
                    items={playlist.items}
                    playingTrack={player.playingTrack}
                    playTrack={playTrack}
                    objectId={objectId}
                />
                {playlist.isFetching ? <Spinner /> : null}
            </React.Fragment>

        );
    }

    renderPlayButton = () => {
        const {
            player,
            playTrack,
            toggleStatus,
            match: { params: { artistId } },
            playlists
        } = this.props;

        const playlistId = artistId + USER_TRACKS_PLAYLIST_SUFFIX;
        const tracksPlaylists = playlists[PlaylistTypes.TRACKS];

        if (!tracksPlaylists || !tracksPlaylists.items.length) return null;

        const first_id = tracksPlaylists.items[0].id;

        if (player.currentPlaylistId === playlistId && player.status === PlayerStatus.PLAYING) {
            return (
                <a href='javascript:void(0)' className='c_btn playing'
                    onClick={() => toggleStatus()}>
                    <i className='icon-pause' />
                    Playing
                </a>
            );
        }

        const toggle = () => {
            if (player.currentPlaylistId === playlistId.toString()) {
                toggleStatus()
            } else {
                playTrack(playlistId.toString(), { id: first_id })
            }
        }

        return (
            <a href='javascript:void(0)' className='c_btn'
                onClick={toggle}>
                <i className='icon-play_arrow' />
                Play
            </a>
        );
    }

    render() {
        const { user, artistIdParam, auth } = this.props;
        const { followings, me } = auth;
        const { small, activeTab } = this.state;

        if (!user || (user && user.loading) || user.track_count === null) return <Spinner contained />;

        const user_img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.LARGE);
        const following = SC.hasID(user.id, followings);

        return (
            <CustomScroll className='column withHeader' heightRelativeToParent='100%'
                allowOuterScroll={true}
                //heightMargin={35}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                threshold={300}
                loadMore={this.fetchMore.bind(this)}
                hasMore={this.canFetchMore()}>

                <Header className='withImage' scrollTop={this.state.scrollTop} />

                <PageHeader image={user_img}>
                    <Row className='trackHeader'>
                        <Col xs='12' md='4' xl='2'>
                            <div className='imageWrapper'>
                                <FallbackImage
                                    src={user_img}
                                    id={user.id} />
                            </div>
                        </Col>

                        <Col xs='12' md='8' xl='' className='trackInfo text-md-left text-xs-center'>
                            <Row className='justify-content-md-between'>
                                <Col xs='12' md='6'>
                                    <h2>{user.username}</h2>
                                    <h3 className='trackArtist'>{user.city}{user.city && user.country ? ' , ' : null}{user.country}</h3>
                                    <div className='button-group'>
                                        {
                                            this.renderPlayButton()
                                        }
                                        {
                                            me && artistIdParam !== me.id ? <a href='javascript:void(0)'
                                                className={cn('c_btn', { following })}
                                                onClick={() => {
                                                    this.toggleFollow()
                                                }}>
                                                {following ? <i className='icon-check' /> : <i className='icon-add' />}
                                                <span>{following ? 'Following' : 'Follow'}</span>
                                            </a> : null
                                        }

                                        <Popover
                                            autoFocus={false}
                                            minimal={true}
                                            position={Position.BOTTOM_LEFT}
                                            content={(
                                                <Menu>
                                                    <MenuItem
                                                        text='View in browser'
                                                        onClick={() => {
                                                            IPC.openExternal(user.permalink_url)
                                                        }} />
                                                    <ShareMenuItem
                                                        username={user.username}
                                                        permalink={user.permalink_url} />
                                                </Menu>
                                            )}
                                        >
                                            <a href='javascript:void(0)' className='c_btn round'>
                                                <i className='icon-more_horiz' />
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


                    <div className='flex tracktabs row'>
                        <a href='javascript:void(0)' className={cn({ active: activeTab === TabTypes.TRACKS })}
                            onClick={() => {
                                this.toggle(TabTypes.TRACKS);
                            }}>
                            <span className='text'>Tracks</span>
                        </a>
                        <a href='javascript:void(0)' className={cn({ active: activeTab === TabTypes.LIKES })}
                            onClick={() => {
                                this.toggle(TabTypes.LIKES);
                            }}>
                            <span className='text'>Likes</span>
                        </a>
                        {
                            small ?
                                <a href='javascript:void(0)' className={cn({ active: activeTab === TabTypes.INFO })}
                                    onClick={() => {
                                        this.toggle(TabTypes.INFO);
                                    }}>
                                    <span className='text'>Info</span>
                                </a> : null
                        }
                    </div>
                </PageHeader>
                <div className='artistPage container-fluid detailPage'>
                    <Row className='main_track_content'>
                        <Col xs='12' lg='8'>

                            <TabContent activeTab={this.state.activeTab} className='px-4'>
                                {/* Tracks */}
                                <TabPane tabId={TabTypes.TRACKS}>
                                    {this.renderPlaylist(PlaylistTypes.TRACKS)}
                                </TabPane>

                                {/* Likes */}
                                <TabPane tabId={TabTypes.LIKES}>
                                    {this.renderPlaylist(PlaylistTypes.LIKES)}
                                </TabPane>

                                {/* Tab for info on smaller screens */}
                                {
                                    small ? (
                                        <TabPane tabId={TabTypes.INFO}>
                                            <div className='artistInfo p-1  pt-5'>
                                                <Linkify text={user.description} />
                                            </div>
                                            <ArtistProfiles
                                                className='pt-1'
                                                profiles={user.profiles} />
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
                                            <Linkify text={user.description} />
                                        </div>
                                    </ToggleMoreComponent>

                                    <ArtistProfiles profiles={user.profiles} />
                                </Col>
                            ) : null
                        }

                    </Row>
                </div>
            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { entities, auth, app, player, objects, ui } = state;
    const { match: { params: { artistId } }, history, location } = props;

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};

    // Denormalize and fetch tracks
    const tracksObjectId = artistId + USER_TRACKS_PLAYLIST_SUFFIX;
    const tracksPlaylistObject = playlistObjects[tracksObjectId];

    let dtracksPlaylistObject: ObjectState<SoundCloud.Track> | null = null;

    if (tracksPlaylistObject) {
        dtracksPlaylistObject = denormalize(tracksPlaylistObject, new schema.Object({
            items: new schema.Array({
                tracks: trackSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    // Denormalize and fetch likes
    const likesObjectId = artistId + USER_LIKES_SUFFIX;
    const likesPlaylistObject = playlistObjects[likesObjectId];

    let dlikesPlaylistObject: ObjectState<SoundCloud.Track> | null = null;

    if (likesPlaylistObject) {
        dlikesPlaylistObject = denormalize(likesPlaylistObject, new schema.Object({
            items: new schema.Array({
                tracks: trackSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    const user = denormalize(artistId, userSchema, entities)

    return {
        app,
        auth,
        player,
        playingTrack: player.playingTrack,
        user,

        playlists: {
            [PlaylistTypes.LIKES]: dlikesPlaylistObject,
            [PlaylistTypes.TRACKS]: dtracksPlaylistObject,
        },
        previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined,
        artistIdParam: +artistId
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    fetchArtistIfNeeded,
    setScrollPosition,
    toggleFollowing,
    fetchMore,
    canFetchMoreOf,
    playTrack,
    toggleStatus,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArtistPage));
