import cn from 'classnames';
import { denormalize, schema } from 'normalizr';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { PLAYLISTS } from '../../../common/constants';
import playlistSchema from '../../../common/schemas/playlist';
import trackSchema from '../../../common/schemas/track';
import { StoreState } from '../../../common/store';
import { AuthState, getAuthAllPlaylistsIfNeeded, getAuthLikesIfNeeded, getAuthTracksIfNeeded } from '../../../common/store/auth';
import { fetchChartsIfNeeded, fetchMore, fetchPlaylistIfNeeded, ObjectState, ObjectTypes } from '../../../common/store/objects';
import { PlayerState, playTrack } from '../../../common/store/player';
import { SortTypes } from '../../../common/store/playlist/types';
import { setScrollPosition } from '../../../common/store/ui';
import { SoundCloud } from '../../../types';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import PageHeader from '../_shared/PageHeader/PageHeader';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import WithHeaderComponent from '../_shared/WithHeaderComponent';

interface OwnProps extends RouteComponentProps<{}> {
    objectId: string;
    title: string;
    backgroundImage?: string;
    gradient?: string;
    sortType?: SortTypes;
    showInfo?: boolean;
    chart?: boolean;
    sortTypeChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface PropsFromState {
    auth: AuthState;
    player: PlayerState;
    playlistObject: ObjectState<SoundCloud.Music> | null;
    previousScrollTop?: number;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    fetchMore: typeof fetchMore;
    setScrollPosition: typeof setScrollPosition;
    fetchChartsIfNeeded: typeof fetchChartsIfNeeded;
    getAuthLikesIfNeeded: typeof getAuthLikesIfNeeded;
    getAuthTracksIfNeeded: typeof getAuthTracksIfNeeded;
    getAuthAllPlaylistsIfNeeded: typeof getAuthAllPlaylistsIfNeeded;
}

interface State {
    scrollTop: number;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class PlayListPage extends WithHeaderComponent<AllProps, State> {

    static defaultProps = {
        showInfo: false,
        chart: false
    };

    componentDidMount() {
        super.componentDidMount();

        this.fetchPlaylist(this.props);
    }

    componentWillReceiveProps(nextProps: AllProps) {
        this.fetchPlaylist(nextProps);
    }

    fetchPlaylist = (props: AllProps) => {
        const {
            playlistObject,
            chart,
            fetchChartsIfNeeded,
            sortType,
            fetchMore,
            objectId,
            getAuthLikesIfNeeded,
            getAuthTracksIfNeeded,
            getAuthAllPlaylistsIfNeeded
        } = props;

        if (!playlistObject) {

            if (chart) {
                fetchChartsIfNeeded(objectId, sortType);
            } else {
                switch (objectId) {
                    case PLAYLISTS.LIKES:
                        getAuthLikesIfNeeded();
                        break;
                    case PLAYLISTS.MYTRACKS:
                        getAuthTracksIfNeeded();
                        break;
                    case PLAYLISTS.PLAYLISTS:
                        getAuthAllPlaylistsIfNeeded();
                        break;
                    default:
                        break;
                }
            }

        } else if (!playlistObject || playlistObject.items.length === 0 && (playlistObject && !playlistObject.isFetching)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS);
        }
    }

    renderChartSort = () => {
        const {
            sortTypeChange,
            sortType,
        } = this.props;

        return (
            <div className='float-right'>
                <div className='bp3-select bp3-minimal'>
                    <select
                        defaultValue={sortType}
                        value={sortType}
                        onChange={sortTypeChange}
                    >
                        <option value={SortTypes.TOP}>{SortTypes.TOP}</option>
                        <option value={SortTypes.TRENDING}>{SortTypes.TRENDING}</option>
                    </select>
                </div>
            </div>
        );
    }

    render() {
        const {
            playlistObject,
            objectId,
            showInfo,
            title,
            player,
            auth: { followings },
            chart,
            backgroundImage,
            gradient,
            // Functions
            playTrack,
            fetchPlaylistIfNeeded,
            fetchMore,
        } = this.props;

        if (!playlistObject || (playlistObject && playlistObject.items.length === 0 && playlistObject.isFetching)) {
            return <Spinner contained={true} />;
        }

        return (
            <CustomScroll
                heightRelativeToParent='100%'
                // heightMargin={35}
                allowOuterScroll={true}
                threshold={300}
                isFetching={playlistObject.isFetching}
                ref={(r) => this.scroll = r}
                loadMore={() => {
                    fetchMore(objectId, ObjectTypes.PLAYLISTS);
                }}
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
                hasMore={!!playlistObject.nextUrl}
            >

                <Header className={cn({ withImage: backgroundImage })} scrollTop={this.state.scrollTop} />

                <PageHeader
                    image={backgroundImage}
                    gradient={gradient}
                >
                    <>
                        {
                            chart && this.renderChartSort()
                        }
                        <h2>{title}</h2>
                    </>
                </PageHeader>

                {
                    (!playlistObject.items.length) ? (
                        <div className='pt-5 mt-5'>
                            <h5 className='text-muted text-center'>That's unfortunate, you don't seem to have any tracks inhere</h5>
                            <div className='text-center' style={{ fontSize: '5rem' }}>
                                🧐
                            </div>
                        </div>
                    ) : (
                            <div>
                                <TracksGrid
                                    followings={followings}
                                    items={playlistObject.items}
                                    playingTrack={player.playingTrack}
                                    currentPlaylistId={player.currentPlaylistId}
                                    objectId={objectId}
                                    showInfo={showInfo}
                                    playTrack={playTrack}
                                    fetchPlaylistIfNeeded={fetchPlaylistIfNeeded}
                                />
                            </div>
                        )
                }

            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, entities, objects, player, ui } = state;
    const { objectId, location, history } = props;

    const playlist_objects = objects[ObjectTypes.PLAYLISTS] || {};
    const playlistObject = playlist_objects[objectId];

    let dPlaylistObject: ObjectState<SoundCloud.Music> | null = null;

    if (playlistObject) {
        dPlaylistObject = denormalize(playlistObject, new schema.Object({
            items: new schema.Array({
                playlists: playlistSchema,
                tracks: trackSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    return {
        auth,
        player,
        playlistObject: dPlaylistObject,
        previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    playTrack,
    fetchPlaylistIfNeeded,
    fetchMore,
    setScrollPosition,
    fetchChartsIfNeeded,
    getAuthLikesIfNeeded,
    getAuthTracksIfNeeded,
    getAuthAllPlaylistsIfNeeded,
}, dispatch);

export default withRouter(connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(PlayListPage));
