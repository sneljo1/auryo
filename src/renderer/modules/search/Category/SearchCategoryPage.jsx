import isEqual from 'lodash/isEqual';
import { denormalize, schema } from 'normalizr';
import PropTypes from "prop-types";
import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../../shared/actions';
import { OBJECT_TYPES, SEARCH_PLAYLISTS_SUFFIX, SEARCH_TRACKS_SUFFIX, SEARCH_USERS_SUFFIX } from '../../../../shared/constants';
import { userSchema } from '../../../../shared/schemas';
import playlistSchema from '../../../../shared/schemas/playlist';
import trackSchema from '../../../../shared/schemas/track';
import Spinner from '../../_shared/Spinner/Spinner';
import TracksGrid from '../../_shared/TracksGrid/TracksGrid';

class SearchCategory extends React.Component {
    state = {
        loading: false
    }

    componentDidMount() {
        const { query, search, playlist_object, object_id } = this.props

        if (!playlist_object && query && query.length) {

            this.setState({
                loading: true
            })
            return search(object_id, query, 25)
                .then(() => {
                    this.setState({
                        loading: false
                    })
                })
        }
    }

    componentWillReceiveProps(nextProps) {
        const { query, search, playlist_object, object_id } = this.props

        if ((query !== nextProps.query || !playlist_object) && query && query.length) {
            this.setState({
                loading: true
            })
            return search(object_id, nextProps.query, 25)
                .then(() => {
                    this.setState({
                        loading: false
                    })
                })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { query, playlist_object } = this.props;
        const { loading } = this.state;

        if (!isEqual(nextProps.query, query) ||
            !isEqual(nextProps.playlist_object, playlist_object) ||
            !isEqual(nextState.loading, loading)) {
            return true
        }
        return false

    }

    hasMore = () => {
        const { object_id, canFetchMoreOf } = this.props

        return canFetchMoreOf(object_id, OBJECT_TYPES.PLAYLISTS)
    }

    loadMore = () => {
        const { object_id, fetchMore, canFetchMoreOf } = this.props

        if (canFetchMoreOf(object_id, OBJECT_TYPES.PLAYLISTS)) {
            fetchMore(object_id, OBJECT_TYPES.PLAYLISTS)
        }
    }

    render() {
        const {
            player,
            entities,
            auth: { followings },
            results,
            fetchPlaylistIfNeeded,
            playTrack,
            object_id,
            toggleFollowing
        } = this.props

        const { loading } = this.state;

        if (loading) {
            return <Spinner />
        }

        return (
            <div>
                <TracksGrid
                    toggleFollowing={toggleFollowing}
                    followings={followings}
                    items={results}
                    player={player}
                    playlist_name={object_id}
                    entities={entities}
                    playTrackFunc={playTrack}
                    fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded}
                />
            </div>
        )
    }
}

SearchCategory.propTypes = {
    query: PropTypes.string.isRequired,
    results: PropTypes.array.isRequired,
    object_id: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
    canFetchMoreOf: PropTypes.func.isRequired,
    fetchMore: PropTypes.func.isRequired,
    toggleFollowing: PropTypes.func.isRequired,
    playTrack: PropTypes.func.isRequired,
    fetchPlaylistIfNeeded: PropTypes.func.isRequired,
    playlist_object: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    entities: PropTypes.object.isRequired,
}

const mapStateToProps = (state, props) => {
    const { auth, entities, objects, player: { playingTrack }, app, player } = state
    const { match: { params } } = props

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}

    let object_id

    switch (params.category) {
        case 'user':
            object_id = props.query + SEARCH_USERS_SUFFIX
            break
        case 'playlist':
            object_id = props.query + SEARCH_PLAYLISTS_SUFFIX
            break
        case 'track':
            object_id = props.query + SEARCH_TRACKS_SUFFIX
            break;
        default:
            break;
    }

    const playlist_object = playlist_objects[object_id]

    let denormalized = []

    if (playlist_object) {
        denormalized = denormalize(playlist_object.items, new schema.Array({
            playlists: playlistSchema,
            tracks: trackSchema,
            users: userSchema
        }, (input) => `${input.kind}s`), entities)
    }

    return {
        object_id,
        entities,
        auth,
        playingTrack,
        app,
        results: denormalized,
        player,
        playlist_object,
        params: {
            category: params.category,
            query: props.query
        }
    }
}

export default connect(mapStateToProps, actions, null, { withRef: true })(SearchCategory)