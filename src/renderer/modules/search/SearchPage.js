import React from 'react'
import * as actions from '../../../shared/actions/index'
import { OBJECT_TYPES } from '../../../shared/constants/index'
import { connect } from 'react-redux'
import './search.scss'
import TracksGrid from '../_shared/TracksGrid/TracksGrid'
import Spinner from '../_shared/Spinner/spinner.component'
import { denormalize, schema } from 'normalizr'
import { PLAYLISTS } from '../../../shared/constants'
import playlistSchema from '../../../shared/schemas/playlist'
import trackSchema from '../../../shared/schemas/track'
import { userSchema } from '../../../shared/schemas'
import _ from 'lodash'

class Search extends React.Component {

    state = {
        loading: false
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps.query, this.props.query) ||
            !_.isEqual(nextProps.playlist_object, this.props.playlist_object) ||
            !_.isEqual(nextState.loading, this.state.loading)) {
            return true
        }
        return false

    }

    componentDidMount() {
        const { query, searchAll, playlist_object } = this.props

        if (!playlist_object && query && query.length) {

            this.setState({
                loading: true
            })
            searchAll(query, 40)
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

            searchAll(nextProps.query, 40)
                .then(() => {
                    this.setState({
                        loading: false
                    })
                })
        }
    }

    hasMore = () => {
        return this.props.canFetchMoreOf(PLAYLISTS.SEARCH, OBJECT_TYPES.PLAYLISTS)
    }

    loadMore = () => {
        if (this.props.canFetchMoreOf(PLAYLISTS.SEARCH, OBJECT_TYPES.PLAYLISTS)) {
            this.props.fetchMore(PLAYLISTS.SEARCH, OBJECT_TYPES.PLAYLISTS)
        }
    }

    render() {
        const {
            player,
            entities,
            auth:{followings},
            results,
            toggleLike,
            toggleRepost,
            fetchPlaylistIfNeeded,
            toggleFollowing,
            playTrack,
            show,
            addUpNext,
            playlist_object,
            object_id,
            togglePlaylistTrack
        } = this.props

        if (this.state.loading || (playlist_object && playlist_object.isFetching)) {
            return (
                <div className="pt-5 mt-5">
                    <Spinner />
                </div>
            )
        }

        if (!results || !results.length) {
            return (
                <div className="pt-5 mt-5">
                    <h5 className='text-muted text-center'>{this.props.query ? `No results for "${this.props.query}"` : 'Search for people, tracks and albums'}</h5>
                    <div className="text-center" style={{ fontSize: '5rem' }}>
                        {this.props.query ? '😭' : '🕵️‍'}
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
                    playTrackFunc={playTrack}
                    fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded} />
            </div>
        )
    }
}


const mapStateToProps = (state, props) => {
    const { auth, entities, objects, player: { playingTrack }, app, player } = state

    const object_id = PLAYLISTS.SEARCH + props.query

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