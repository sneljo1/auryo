import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { StoreState } from '../../../common/store';
import { AuthState, getAuthAllPlaylistsIfNeeded, getAuthLikesIfNeeded, getAuthTracksIfNeeded } from '../../../common/store/auth';
import { fetchChartsIfNeeded, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from '../../../common/store/objects';
import { getPlaylistObject } from '../../../common/store/objects/selectors';
import { PlayerState } from '../../../common/store/player';
import { SortTypes } from '../../../common/store/playlist/types';
import { setScrollPosition } from '../../../common/store/ui';
import { getPreviousScrollTop } from '../../../common/store/ui/selectors';
import { NormalizedResult } from '../../../types';
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
    playlistObject: ObjectState<NormalizedResult> | null;
    previousScrollTop?: number;
}

interface PropsFromDispatch {
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
                    case PlaylistTypes.LIKES:
                        getAuthLikesIfNeeded();
                        break;
                    case PlaylistTypes.MYTRACKS:
                        getAuthTracksIfNeeded();
                        break;
                    case PlaylistTypes.PLAYLISTS:
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
            chart,
            backgroundImage,
            gradient,
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
                            <TracksGrid
                                items={playlistObject.items}
                                objectId={objectId}
                                showInfo={showInfo}
                            />
                        )
                }

            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, player } = state;
    const { objectId } = props;

    return {
        auth,
        player,
        playlistObject: getPlaylistObject(objectId)(state),
        previousScrollTop: getPreviousScrollTop(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    fetchMore,
    setScrollPosition,
    fetchChartsIfNeeded,
    getAuthLikesIfNeeded,
    getAuthTracksIfNeeded,
    getAuthAllPlaylistsIfNeeded,
}, dispatch);

export default withRouter(connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(PlayListPage));
