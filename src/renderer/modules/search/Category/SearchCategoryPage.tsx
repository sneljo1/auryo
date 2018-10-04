import isEqual from 'lodash/isEqual';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { SEARCH_PLAYLISTS_SUFFIX, SEARCH_TRACKS_SUFFIX, SEARCH_USERS_SUFFIX } from '../../../../shared/constants';
import { userSchema } from '../../../../shared/schemas';
import playlistSchema from '../../../../shared/schemas/playlist';
import trackSchema from '../../../../shared/schemas/track';
import { StoreState } from '../../../../shared/store';
import { AuthState, toggleFollowing } from '../../../../shared/store/auth';
import { canFetchMoreOf, fetchMore, fetchPlaylistIfNeeded, ObjectState, ObjectTypes } from '../../../../shared/store/objects';
import { search } from '../../../../shared/store/objects/playlists/search/actions';
import { PlayerState, playTrack } from '../../../../shared/store/player';
import { SoundCloud } from '../../../../types';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

interface OwnProps extends RouteComponentProps<{
    category: "user" | "playlist" | "track";
    query: string;
}> {

}

interface PropsFromState {
    playlist: ObjectState<SoundCloud.All> | null;
    objectId: string;
    auth: AuthState;
    player: PlayerState;
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
    }

    componentDidMount() {
        const { match: { params: { query } }, search, playlist, objectId } = this.props

        if (!playlist && query && query.length) {
            search(objectId, query, 25)
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { match: { params: { query } }, search, playlist, objectId } = this.props

        if ((query !== nextProps.match.params.query || !playlist) && query && query.length) {
            search(objectId, nextProps.match.params.query, 25)
        }
    }

    shouldComponentUpdate(nextProps: AllProps) {
        const { match: { params: { query } }, playlist } = this.props;

        if (!isEqual(nextProps.match.params.query, query) ||
            !isEqual(nextProps.playlist, playlist)) {
            return true
        }
        return false

    }

    hasMore = () => {
        const { objectId, canFetchMoreOf } = this.props

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)
    }

    loadMore = () => {
        const { objectId, fetchMore, canFetchMoreOf } = this.props

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS)
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
        } = this.props

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <div className="pt-5 mt-5">
                    <Spinner contained />
                </div>
            )
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
        )
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, entities, objects, player } = state
    const { match: { params: { query, category } } } = props

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {}

    let objectId: string = "";

    switch (category) {
        case 'user':
            objectId = query + SEARCH_USERS_SUFFIX
            break
        case 'playlist':
            objectId = query + SEARCH_PLAYLISTS_SUFFIX
            break
        case 'track':
            objectId = query + SEARCH_TRACKS_SUFFIX
            break;
        default:
            break;
    }

    const playlistObject = playlistObjects[objectId]

    let dplaylistObject: ObjectState<SoundCloud.All> | null = null

    if (playlistObject) {
        dplaylistObject = denormalize(playlistObject, new schema.Object({
            items: new schema.Array({
                playlists: playlistSchema,
                tracks: trackSchema,
                users: userSchema
            }, (input) => `${input.kind}s`)
        }), entities)
    }

    return {
        objectId,
        auth,
        playlist: dplaylistObject,
        player
    }
}

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    search,
    canFetchMoreOf,
    fetchMore,
    fetchPlaylistIfNeeded,
    playTrack,
    toggleFollowing,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps, null, { withRef: true })(SearchCategory)