import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Col, Row, TabContent, TabPane } from 'reactstrap';
import { bindActionCreators } from 'redux';
import { IMAGE_SIZES } from '../../../common/constants';
import { StoreState } from '../../../common/store';
import { Dimensions } from '../../../common/store/app';
import { AuthState, toggleFollowing } from '../../../common/store/auth';
import { getUserEntity } from '../../../common/store/entities/selectors';
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from '../../../common/store/objects';
import { getArtistLikesPlaylistObject, getArtistTracksPlaylistObject, getPlaylistName } from '../../../common/store/objects/selectors';
import { PlayerStatus, playTrack, toggleStatus } from '../../../common/store/player';
import { setScrollPosition } from '../../../common/store/ui';
import { getPreviousScrollTop } from '../../../common/store/ui/selectors';
import { fetchArtistIfNeeded } from '../../../common/store/user/actions';
import { abbreviate_number, SC } from '../../../common/utils';
import { IPC } from '../../../common/utils/ipc';
import { NormalizedResult, SoundCloud } from '../../../types';
import Header from '../../app/components/Header/Header';
import CustomScroll from '../../_shared/CustomScroll';
import FallbackImage from '../../_shared/FallbackImage';
import Linkify from '../../_shared/Linkify';
import PageHeader from '../../_shared/PageHeader/PageHeader';
import ShareMenuItem from '../../_shared/ShareMenuItem';
import Spinner from '../../_shared/Spinner/Spinner';
import ToggleMore from '../../_shared/ToggleMore';
import TrackList from '../../_shared/TrackList/TrackList';
import WithHeaderComponent from '../../_shared/WithHeaderComponent';
import './ArtistPage.scss';
import ArtistProfiles from './components/ArtistProfiles/ArtistProfiles';

interface OwnProps extends RouteComponentProps<{ artistId: string }> {
}

interface PropsFromState {
    dimensions: Dimensions;
    isPlayerPlaylist: boolean;
    isPlaylistPlaying: boolean;
    auth: AuthState;
    user: SoundCloud.User | null;
    playlists: {
        [PlaylistTypes.ARTIST_LIKES]: ObjectState<NormalizedResult> | null,
        [PlaylistTypes.ARTIST_TRACKS]: ObjectState<NormalizedResult> | null,
    };
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
        const { fetchArtistIfNeeded, artistIdParam, dimensions } = nextProps;
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
            playlist_name = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
        } else if (activeTab === TabTypes.LIKES) {
            playlist_name = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
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
            playlist_name = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
        } else if (activeTab === TabTypes.LIKES) {
            playlist_name = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
        }

        if (playlist_name) {
            canFetchMoreOf(playlist_name, ObjectTypes.PLAYLISTS);
        }
    }

    renderPlaylist = (type: PlaylistTypes) => {
        const {
            match: { params: { artistId } },
            playlists
        } = this.props;

        const objectId = getPlaylistName(artistId, type);
        const playlist = playlists[type];

        if (!playlist) return <Spinner contained={true} />;

        return (
            <React.Fragment>
                <TrackList
                    items={playlist.items}
                    objectId={objectId}
                />
                {playlist.isFetching ? <Spinner /> : null}
            </React.Fragment>

        );
    }

    renderPlayButton = () => {
        const {
            playTrack,
            isPlaylistPlaying,
            isPlayerPlaylist,
            toggleStatus,
            match: { params: { artistId } },
            playlists
        } = this.props;

        const playlistId = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
        const tracksPlaylists = playlists[PlaylistTypes.ARTIST_TRACKS];

        if (!tracksPlaylists || !tracksPlaylists.items.length) return null;

        const first_id = tracksPlaylists.items[0].id;

        if (isPlaylistPlaying) {
            return (
                <a
                    href='javascript:void(0)'
                    className='c_btn playing round playButton'
                    onClick={() => toggleStatus()}
                >
                    <i className='bx bx-pause' />
                </a>
            );
        }

        const toggle = () => {
            if (isPlayerPlaylist) {
                toggleStatus();
            } else {
                playTrack(playlistId.toString(), { id: first_id });
            }
        };

        return (
            <a
                href='javascript:void(0)'
                className='c_btn round playButton'
                onClick={toggle}
            >
                <i className='bx bx-play' />
            </a>
        );
    }

    render() {
        const { user, artistIdParam, auth } = this.props;
        const { followings, me } = auth;
        const { small, activeTab } = this.state;

        if (!user || (user && user.loading) || user.track_count === null) return <Spinner contained={true} />;

        const user_img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.LARGE);
        const following = SC.hasID(user.id, followings);

        return (
            <CustomScroll
                className='column withHeader'
                heightRelativeToParent='100%'
                allowOuterScroll={true}
                // heightMargin={35}
                ref={(r) => this.scroll = r}
                onScroll={this.debouncedOnScroll}
                threshold={300}
                loadMore={() => {
                    this.fetchMore();
                }}
                hasMore={this.canFetchMore()}
            >

                <Header className='withImage' scrollTop={this.state.scrollTop} />

                <PageHeader image={user_img}>
                    <Row className='trackHeader'>
                        <Col xs='12' md='4' xl='3'>
                            <div className='imageWrapper'>
                                <FallbackImage
                                    src={user_img}
                                />
                            </div>
                        </Col>

                        <Col xs='12' md='8' xl='' className='trackInfo text-md-left text-xs-center'>

                            <h2>{user.username}</h2>
                            <h3 className='trackArtist'>{user.city}{user.city && user.country ? ' , ' : null}{user.country}</h3>
                            <div className='button-group'>
                                {
                                    this.renderPlayButton()
                                }
                                {
                                    me && artistIdParam !== me.id ? (
                                        <a
                                            href='javascript:void(0)'
                                            className={cn('c_btn', { liked: following })}
                                            onClick={() => {
                                                this.toggleFollow();
                                            }}
                                        >
                                            {following ? <i className='bx bx-check' /> : <i className='bx bx-plus' />}
                                            <span>{following ? 'Following' : 'Follow'}</span>
                                        </a>
                                    ) : null
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
                                                    IPC.openExternal(user.permalink_url);
                                                }}
                                            />
                                            <ShareMenuItem
                                                username={user.username}
                                                permalink={user.permalink_url}
                                            />
                                        </Menu>
                                    )}
                                >
                                    <a href='javascript:void(0)' className='c_btn round'>
                                        <i className='bx bx-dots-horizontal-rounded' />
                                    </a>
                                </Popover>
                            </div>
                        </Col>

                    </Row>


                    <div className='flex tracktabs row'>
                        <a
                            href='javascript:void(0)'
                            className={cn({ active: activeTab === TabTypes.TRACKS })}
                            onClick={() => {
                                this.toggle(TabTypes.TRACKS);
                            }}
                        >
                            <span className='text'>Tracks</span>
                        </a>
                        <a
                            href='javascript:void(0)'
                            className={cn({ active: activeTab === TabTypes.LIKES })}
                            onClick={() => {
                                this.toggle(TabTypes.LIKES);
                            }}
                        >
                            <span className='text'>Likes</span>
                        </a>
                        {
                            small ? (
                                <a
                                    href='javascript:void(0)'
                                    className={cn({ active: activeTab === TabTypes.INFO })}
                                    onClick={() => {
                                        this.toggle(TabTypes.INFO);
                                    }}
                                >
                                    <span className='text'>Info</span>
                                </a>
                            ) : null
                        }
                    </div>
                </PageHeader>
                <div className='artistPage container-fluid detailPage'>
                    <Row className='main_track_content'>
                        <Col xs='12' lg='8'>

                            <TabContent activeTab={this.state.activeTab} className='px-1'>
                                {/* Tracks */}
                                <TabPane tabId={TabTypes.TRACKS}>
                                    {this.renderPlaylist(PlaylistTypes.ARTIST_TRACKS)}
                                </TabPane>

                                {/* Likes */}
                                <TabPane tabId={TabTypes.LIKES}>
                                    {this.renderPlaylist(PlaylistTypes.ARTIST_LIKES)}
                                </TabPane>

                                {/* Tab for info on smaller screens */}
                                {
                                    small ? (
                                        <TabPane tabId={TabTypes.INFO}>
                                            {this.renderInfo()}
                                        </TabPane>
                                    ) : null
                                }
                            </TabContent>

                        </Col>
                        {
                            !small ? (
                                <Col xs='4' className='artistSide'>
                                    {this.renderInfo(true)}
                                </Col>
                            ) : null
                        }

                    </Row>
                </div>
            </CustomScroll>
        );
    }

    renderInfo = (toggleMore: boolean = false) => {
        const { user } = this.props;

        if (!user) return null;

        return (
            <>
                <ul className='artistStats d-flex'>
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
                {
                    toggleMore ? (
                        <ToggleMore>
                            <div className='artistInfo'>
                                <Linkify text={user.description} />
                            </div>
                        </ToggleMore>
                    ) : (
                            <div className='artistInfo p-1  pt-5'>
                                <Linkify text={user.description} />
                            </div>
                        )
                }

                <ArtistProfiles
                    className='pt-1'
                    profiles={user.profiles}
                />
            </>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, app: { dimensions }, player: { currentPlaylistId, status } } = state;
    const { match: { params: { artistId } } } = props;

    const playlistId = getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS);
    const isPlayerPlaylist = currentPlaylistId === playlistId;
    const isPlaylistPlaying = isPlayerPlaylist && status === PlayerStatus.PLAYING;

    return {
        dimensions,
        auth,
        isPlayerPlaylist,
        isPlaylistPlaying,
        user: getUserEntity(+artistId)(state),
        playlists: {
            [PlaylistTypes.ARTIST_TRACKS]: getArtistTracksPlaylistObject(artistId)(state),
            [PlaylistTypes.ARTIST_LIKES]: getArtistLikesPlaylistObject(artistId)(state),
        },
        previousScrollTop: getPreviousScrollTop(state),
        artistIdParam: +artistId
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    fetchArtistIfNeeded,
    setScrollPosition,
    toggleFollowing,
    fetchMore,
    canFetchMoreOf,
    playTrack,
    toggleStatus,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArtistPage));
