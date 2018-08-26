import isEqual from 'lodash/isEqual';
import { denormalize, schema } from 'normalizr';
import PropTypes from "prop-types";
import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../shared/actions';
import { OBJECT_TYPES, SEARCH_SUFFIX } from '../../../shared/constants';
import { userSchema } from '../../../shared/schemas';
import playlistSchema from '../../../shared/schemas/playlist';
import trackSchema from '../../../shared/schemas/track';
import Spinner from '../_shared/Spinner/Spinner';
import TracksGrid from '../_shared/TracksGrid/TracksGrid';
import './search.scss';

class Search extends React.Component {

    state = {
        loading: false
    }

    componentDidMount() {
        const { query, searchAll, playlist_object } = this.props

        if (!playlist_object && query && query.length) {

            this.setState({
                loading: true
            })

            return searchAll(query, 40)
                .then(() => {
                    this.setState({
                        loading: false
                    })
                })
        }
    }

    componentWillReceiveProps(nextProps) {
        const { query, searchAll, playlist_object } = this.props

        if ((query !== nextProps.query || !playlist_object) && nextProps.query && nextProps.query.length) {
            this.setState({
                loading: true
            })

            return searchAll(nextProps.query, 40)
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
        const { canFetchMoreOf, object_id } = this.props;

        return canFetchMoreOf(object_id, OBJECT_TYPES.PLAYLISTS)
    }

    loadMore = () => {
        const { canFetchMoreOf, fetchMore, object_id } = this.props;

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
            toggleFollowing,
            playTrack,
            playlist_object,
            object_id,
            query
        } = this.props

        const { loading } = this.state;

        if (loading) {
            return (
                <div className="pt-5 mt-5">
                    <Spinner contained />
                </div>
            )
        }

        if (query === "" || !results || !results.length && (playlist_object && !playlist_object.isFetching)) {
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
                    items={results}
                    player={player}
                    playlist_name={object_id}
                    entities={entities}
                    toggleFollowing={toggleFollowing}

                    playTrackFunc={playTrack}
                    fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded} />

                {
                    playlist_object && playlist_object.isFetching && <Spinner />
                }
            </div>
        )
    }
}

Search.propTypes = {
    query: PropTypes.string,
    results: PropTypes.array.isRequired,
    object_id: PropTypes.string.isRequired,
    searchAll: PropTypes.func.isRequired,
    canFetchMoreOf: PropTypes.func.isRequired,
    fetchMore: PropTypes.func.isRequired,
    toggleFollowing: PropTypes.func.isRequired,
    playTrack: PropTypes.func.isRequired,
    fetchPlaylistIfNeeded: PropTypes.func.isRequired,
    playlist_object: PropTypes.object,
    auth: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    entities: PropTypes.object.isRequired,
}

Search.defaultProps = {
    playlist_object: null,
    query: ""
}


const mapStateToProps = (state, props) => {
    const { auth, entities, objects, player: { playingTrack }, app, player } = state

    const object_id = props.query + SEARCH_SUFFIX

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}
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
        entities,
        auth,
        playingTrack,
        app,
        player,
        results: denormalized,
        playlist_object,
        object_id
    }
}

export default connect(mapStateToProps, actions, null, { withRef: true })(Search)