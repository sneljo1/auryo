import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { StoreState } from '../../../../common/store';
import { canFetchMoreOf, fetchMore, ObjectState, ObjectTypes, PlaylistTypes } from '../../../../common/store/objects';
import { search } from '../../../../common/store/objects/playlists/search/actions';
import { getPlaylistName, getPlaylistObject } from '../../../../common/store/objects/selectors';
import { setScrollPosition } from '../../../../common/store/ui';
import { getPreviousScrollTop } from '../../../../common/store/ui/selectors';
import { NormalizedResult } from '../../../../types';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';
import SearchWrapper from '../SearchWrapper';

interface OwnProps extends RouteComponentProps<{
    category: 'user' | 'playlist' | 'track';
}> {

}

interface PropsFromState {
    playlist: ObjectState<NormalizedResult> | null;
    objectId: string;
    query: string;
    previousScrollTop?: number;
}

interface PropsFromDispatch {
    search: typeof search;
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
    setScrollPosition: typeof setScrollPosition;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class SearchCategory extends React.Component<AllProps> {

    componentDidMount() {
        const { query, playlist, objectId, search } = this.props;

        if (!playlist && query && query.length) {
            search({ query }, objectId, 25);
        }
    }

    componentDidUpdate(prevProps: AllProps) {
        const { query, playlist, objectId, search } = this.props;

        if ((query !== prevProps.query || !playlist) && query && query.length) {
            search({ query }, objectId, 25);
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
            location,
            previousScrollTop,
            query,
        } = this.props;

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <Spinner contained={true} />
            );
        }

        return (
            <SearchWrapper
                loadMore={this.loadMore}
                hasMore={this.hasMore}
                location={location}
                setScrollPosition={setScrollPosition}
                previousScrollTop={previousScrollTop}
                query={query}
            >
                <TracksGrid
                    items={playlist.items}
                    objectId={objectId}
                />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </SearchWrapper>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { match: { params: { category } }, location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace('?', ''));

    let objectId: string = '';

    switch (category) {
        case 'user':
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_USER);
            break;
        case 'playlist':
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_PLAYLIST);
            break;
        case 'track':
            objectId = getPlaylistName(query, PlaylistTypes.SEARCH_TRACK);
            break;
        default:
            break;
    }

    return {
        objectId,
        playlist: getPlaylistObject(objectId)(state),
        query,
        previousScrollTop: getPreviousScrollTop(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
    setScrollPosition
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(SearchCategory);
