import { isEqual } from 'lodash';
import { denormalize, schema } from 'normalizr';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToPropsParam } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { SEARCH_SUFFIX } from '../../../common/constants';
import { userSchema } from '../../../common/schemas';
import playlistSchema from '../../../common/schemas/playlist';
import trackSchema from '../../../common/schemas/track';
import { StoreState } from '../../../common/store';
import { AuthState, toggleFollowing } from '../../../common/store/auth';
import { canFetchMoreOf, fetchMore, fetchPlaylistIfNeeded, ObjectState, ObjectTypes } from '../../../common/store/objects';
import { searchAll } from '../../../common/store/objects/playlists/search/actions';
import { PlayerState, playTrack } from '../../../common/store/player';
import { setScrollPosition } from '../../../common/store/ui';
import { SoundCloud } from '../../../types';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import SearchWrapper from './SearchWrapper';

interface OwnProps extends RouteComponentProps<{}> {
}

interface PropsFromState {
    playlist: ObjectState<SoundCloud.All> | null;
    objectId: string;
    auth: AuthState;
    player: PlayerState;
    query: string;
    previousScrollTop?: number;
}

interface PropsFromDispatch {
    searchAll: typeof searchAll;
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
    toggleFollowing: typeof toggleFollowing;
    playTrack: typeof playTrack;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    setScrollPosition: typeof setScrollPosition;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class Search extends React.Component<AllProps> {

    componentDidMount() {
        const { query, searchAll, playlist } = this.props;

        if (!playlist && query && query.length) {
            searchAll(query, 15);
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { query, searchAll, playlist } = this.props;

        if ((query !== nextProps.query || !playlist) && nextProps.query && nextProps.query.length) {
            searchAll(nextProps.query, 15);
        }
    }

    shouldComponentUpdate(nextProps: AllProps) {
        const { query, playlist, player } = this.props;

        if (!isEqual(nextProps.query, query) ||
            !isEqual(nextProps.playlist, playlist) ||
            !isEqual(nextProps.player.playingTrack, player.playingTrack)) {
            return true;
        }
        return false;

    }

    hasMore = () => {
        const { canFetchMoreOf, objectId } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS) as any;
    }

    loadMore = () => {
        const { canFetchMoreOf, fetchMore, objectId } = this.props;

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS);
        }
    }

    renderContent() {
        const {
            player,
            auth: { followings },
            fetchPlaylistIfNeeded,
            toggleFollowing,
            playTrack,
            playlist,
            objectId,
            query
        } = this.props;

        if (query === '' || (playlist && !playlist.items.length && !playlist.isFetching)) {
            return (
                <div className='pt-5 mt-5'>
                    <h5 className='text-muted text-center'>{query ? `No results for "${query}"` : 'Search for people, tracks and albums'}</h5>
                    <div className='text-center' style={{ fontSize: '5rem' }}>
                        {query ? '😭' : '🕵️‍'}
                    </div>
                </div>
            );
        }

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <div className='pt-5 mt-5'>
                    <Spinner contained={true} />
                </div>
            );
        }

        return (
            <div>
                <TracksGrid
                    followings={followings}
                    items={playlist.items}
                    playingTrack={player.playingTrack}
                    currentPlaylistId={player.currentPlaylistId}
                    objectId={objectId}
                    toggleFollowing={toggleFollowing}
                    playTrack={playTrack}
                    fetchPlaylistIfNeeded={fetchPlaylistIfNeeded}
                />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </div>
        );
    }

    render() {
        const { query, location, setScrollPosition, previousScrollTop } = this.props;
        return (
            <SearchWrapper
                loadMore={this.loadMore}
                hasMore={this.hasMore}
                location={location}
                setScrollPosition={setScrollPosition}
                previousScrollTop={previousScrollTop}
                query={query}
            >
                {this.renderContent()}
            </SearchWrapper>
        );
    }
}

const mapStateToProps: MapStateToPropsParam<PropsFromState, OwnProps, StoreState> = (state, props) => {
    const { auth, entities, objects, player, ui } = state;
    const { history, location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace('?', ''));

    const objectId = query + SEARCH_SUFFIX;

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};
    const playlistObject = playlistObjects[objectId];

    let dplaylistObject: ObjectState<SoundCloud.All> | null = null;

    if (playlistObject) {
        dplaylistObject = denormalize(playlistObject, new schema.Object({
            items: new schema.Array({
                playlists: playlistSchema,
                tracks: trackSchema,
                users: userSchema
            }, (input) => `${input.kind}s`)
        }), entities);
    }

    return {
        auth,
        player,
        query,
        playlist: dplaylistObject,
        objectId,
        previousScrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined

    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    searchAll,
    canFetchMoreOf,
    fetchMore,
    toggleFollowing,
    playTrack,
    fetchPlaylistIfNeeded,
    setScrollPosition
}, dispatch);

export default withRouter(connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(Search));
