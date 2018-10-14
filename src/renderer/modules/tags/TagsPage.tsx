import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { Nav } from 'reactstrap';
import { bindActionCreators } from 'redux';
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from '../../../common/store/objects';
import { NormalizedResult } from 'src/types';
import { StoreState } from '../../../common/store';
import { searchByTag } from '../../../common/store/objects/playlists/search/actions';
import { getPlaylistName, getPlaylistObject } from '../../../common/store/objects/selectors';
import { setScrollPosition } from '../../../common/store/ui';
import { getPreviousScrollTop } from '../../../common/store/ui/selectors';
import Header from '../app/components/Header/Header';
import CustomScroll from '../_shared/CustomScroll';
import PageHeader from '../_shared/PageHeader/PageHeader';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import WithHeaderComponent from '../_shared/WithHeaderComponent';

interface OwnProps extends RouteComponentProps<{ tag: string, type: string }> {
}

interface PropsFromState {
    playlist: ObjectState<NormalizedResult> | null;
    objectId: string;
    tag: string;
    showType: TabTypes;
    previousScrollTop?: number;
}

interface PropsFromDispatch {
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
    setScrollPosition: typeof setScrollPosition;
    searchByTag: typeof searchByTag;
}

interface State {
    scrollTop: number;
}

enum TabTypes {
    TRACKS = 'TRACKS',
    PLAYLISTS = 'PLAYLISTS'
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TagsPage extends WithHeaderComponent<AllProps, State> {

    componentDidMount() {
        const { tag, playlist, objectId, searchByTag } = this.props;

        if (!playlist && tag && tag.length) {
            searchByTag(objectId, tag, 25);
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { tag, playlist, objectId, searchByTag } = this.props;

        if ((tag !== nextProps.tag || !playlist) && tag && tag.length) {
            searchByTag(objectId, nextProps.tag, 25);
        }
    }

    hasMore = (): boolean => {
        const { objectId, canFetchMoreOf } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any;
    }

    loadMore = () => {
        const { objectId, fetchMore, canFetchMoreOf } = this.props;

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS);
        }
    }

    render() {
        const {
            objectId,
            playlist,
            showType,
            tag,
        } = this.props;

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <Spinner contained={true} />
            );
        }

        return (
            <CustomScroll
                heightRelativeToParent='100%'
                // heightMargin={35}
                allowOuterScroll={true}
                threshold={300}
                isFetching={playlist.isFetching}
                ref={(r) => this.scroll = r}
                loadMore={this.loadMore}
                loader={<Spinner />}
                onScroll={this.debouncedOnScroll}
                hasMore={this.hasMore}
            >

                <Header scrollTop={this.state.scrollTop} />

                <PageHeader title={`Most popular ${showType === TabTypes.TRACKS ? 'tracks' : 'playlists'} for #${tag}`} />

                <div className='container-fluid charts'>
                    <Nav className='tabs' tabs={true}>
                        <NavLink
                            className={cn('nav-link', { active: showType === TabTypes.TRACKS })}
                            to={`/tags/${tag}/${TabTypes.TRACKS}`}
                            activeClassName='active'
                        >
                            Tracks
                        </NavLink>

                        <NavLink
                            className={cn('nav-link', { active: showType === TabTypes.PLAYLISTS })}
                            activeClassName='active'
                            to={`/tags/${tag}/${TabTypes.PLAYLISTS}`}
                        >
                            Playlists
                        </NavLink>
                    </Nav>
                </div>

                <TracksGrid
                    items={playlist.items}
                    objectId={objectId}
                />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </CustomScroll>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { match: { params: { tag, type } } } = props;

    const showType = type as TabTypes || TabTypes.TRACKS;

    const objectId = getPlaylistName(tag, showType === TabTypes.TRACKS ? PlaylistTypes.SEARCH_TRACK : PlaylistTypes.SEARCH_PLAYLIST);

    return {
        objectId,
        playlist: getPlaylistObject(objectId)(state),
        tag,
        showType,
        previousScrollTop: getPreviousScrollTop(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    searchByTag,
    canFetchMoreOf,
    fetchMore,
    setScrollPosition
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TagsPage);
