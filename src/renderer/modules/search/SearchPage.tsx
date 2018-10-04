import isEqual from 'lodash/isEqual';
import { denormalize, schema } from 'normalizr';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { SEARCH_SUFFIX } from '../../../shared/constants';
import { userSchema } from '../../../shared/schemas';
import playlistSchema from '../../../shared/schemas/playlist';
import trackSchema from '../../../shared/schemas/track';
import { StoreState } from '../../../shared/store';
import { AuthState, toggleFollowing } from '../../../shared/store/auth';
import { canFetchMoreOf, fetchMore, fetchPlaylistIfNeeded, ObjectState, ObjectTypes } from '../../../shared/store/objects';
import { searchAll } from '../../../shared/store/objects/playlists/search/actions';
import { PlayerState, playTrack } from '../../../shared/store/player';
import { SoundCloud } from '../../../types';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';

interface OwnProps {
    query: string;
}

interface PropsFromState {
    playlist: ObjectState<SoundCloud.All> | null;
    objectId: string;
    auth: AuthState;
    player: PlayerState;
}

interface PropsFromDispatch {
    searchAll: typeof searchAll;
    canFetchMoreOf: typeof canFetchMoreOf;
    fetchMore: typeof fetchMore;
    toggleFollowing: typeof toggleFollowing;
    playTrack: typeof playTrack;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class Search extends React.Component<AllProps> {

    componentDidMount() {
        const { query, searchAll, playlist } = this.props

        if (!playlist && query && query.length) {
            searchAll(query, 40)
        }
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { query, searchAll, playlist } = this.props

        if ((query !== nextProps.query || !playlist) && nextProps.query && nextProps.query.length) {
            searchAll(nextProps.query, 40)
        }
    }

    shouldComponentUpdate(nextProps: AllProps) {
        const { query, playlist, player } = this.props;

        if (!isEqual(nextProps.query, query) ||
            !isEqual(nextProps.playlist, playlist) ||
            !isEqual(nextProps.player.playingTrack, player.playingTrack)) {
            return true
        }
        return false

    }

    hasMore = () => {
        const { canFetchMoreOf, objectId } = this.props;

        return canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)
    }

    loadMore = () => {
        const { canFetchMoreOf, fetchMore, objectId } = this.props;

        if (canFetchMoreOf(objectId, ObjectTypes.PLAYLISTS)) {
            fetchMore(objectId, ObjectTypes.PLAYLISTS)
        }
    }

    render() {
        const {
            player,
            auth: { followings },
            fetchPlaylistIfNeeded,
            toggleFollowing,
            playTrack,
            playlist,
            objectId,
            query
        } = this.props

        if (!playlist || (playlist && !playlist.items.length && playlist.isFetching)) {
            return (
                <div className="pt-5 mt-5">
                    <Spinner contained />
                </div>
            )
        }

        if (query === "" || (playlist && !playlist.items.length && !playlist.isFetching)) {
            return (
                <div className="pt-5 mt-5">
                    <h5 className='text-muted text-center'>{query ? `No results for "${query}"` : 'Search for people, tracks and albums'}</h5>
                    <div className="text-center" style={{ fontSize: '5rem' }}>
                        {query ? '😭' : '🕵️‍'}
                    </div>
                </div>
            )
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
                    fetchPlaylistIfNeeded={fetchPlaylistIfNeeded} />

                {
                    playlist && playlist.isFetching && <Spinner />
                }
            </div>
        )
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { auth, entities, objects, player } = state

    const objectId = props.query + SEARCH_SUFFIX

    const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {}
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
        auth,
        player,
        playlist: dplaylistObject,
        objectId
    }
}

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    searchAll,
    canFetchMoreOf,
    fetchMore,
    toggleFollowing,
    playTrack,
    fetchPlaylistIfNeeded,
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Search)