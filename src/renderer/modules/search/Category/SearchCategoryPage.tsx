import { isEqual } from 'lodash';
import { denormalize, schema } from 'normalizr';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { SEARCH_PLAYLISTS_SUFFIX, SEARCH_TRACKS_SUFFIX, SEARCH_USERS_SUFFIX } from '../../../../common/constants';
import { userSchema } from '../../../../common/schemas';
import playlistSchema from '../../../../common/schemas/playlist';
import trackSchema from '../../../../common/schemas/track';
import { StoreState } from '../../../../common/store';
import { AuthState, toggleFollowing } from '../../../../common/store/auth';
import { canFetchMoreOf, fetchMore, fetchPlaylistIfNeeded, ObjectState, ObjectTypes } from '../../../../common/store/objects';
import { search } from '../../../../common/store/objects/playlists/search/actions';
import { PlayerState, playTrack } from '../../../../common/store/player';
import { SoundCloud } from '../../../../types';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

interface OwnProps extends RouteComponentProps<{
    category: 'user' | 'playlist' | 'track';
}> {

}

interface PropsFromState {
    playlist: ObjectState<SoundCloud.All> | null;
    objectId: string;
    auth: AuthState;
    player: PlayerState;
    query: string;
}

interface PropsFromDispatch {
    search: typeof search;
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    playTrack: typeof playTrack;
    toggleFollowing: typeof toggleFollowing;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class SearchCategory extends React.Component<AllProps> {
    state = {
        loading: false
    };

    componentDidMount() {
        const { query, playlist, objectId, search } = this.props;

        if (!playlist && query && query.length) {
            search(objectId, query, 25);
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { query, playlist, objectId, search } = this.props;

        if ((query !== nextProps.query || !playlist) && query && query.length) {
            search(objectId, nextProps.query, 25);
        }
    }

    shouldComponentUpdate(nextProps: AllProps) {
        const { query, playlist } = this.props;

        if (!isEqual(nextProps.query, query) ||
            !isEqual(nextProps.playlist, playlist)) {
            return true;
        }
        return false;

    }

    hasMore = () => {
        const { objectId, canFetchMoreOf } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS);
    }

    loadMore = () => {
        const { objectId, fetchMore, canFetchMoreOf } = this.props;

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS);
        }
    }

    render() {
        const {
            player,
            auth: { followings },
            fetchPlaylistIfNeeded,
            playTrack,
            objectId,
            playlist,
            toggleFollowing
        } = this.props;

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
                    toggleFollowing={toggleFollowing}
                    followings={followings}
                    items={playlist.items}
                    playingTrack={player.playingTrack}
                    currentPlaylistId={player.currentPlaylistId}
                    objectId={objectId}
                    playTrack={playTrack}
                    fetchPlaylistIfNeeded={fetchPlaylistIfNeeded}
                />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, entities, objects, player } = state;
    const { match: { params: { category } }, location: { search: rawSearch } } = props;

    const query: string = decodeURI(rawSearch.replace('?', ''));

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};

    let objectId: string = '';

    switch (category) {
        case 'user':
            objectId = query + SEARCH_USERS_SUFFIX;
            break;
        case 'playlist':
            objectId = query + SEARCH_PLAYLISTS_SUFFIX;
            break;
        case 'track':
            objectId = query + SEARCH_TRACKS_SUFFIX;
            break;
        default:
            break;
    }

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
        objectId,
        auth,
        playlist: dplaylistObject,
        player,
        query
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
    fetchPlaylistIfNeeded,
    playTrack,
    toggleFollowing,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(SearchCategory);
