import React from 'react'
import * as actions from '../../../../shared/actions/index'
import { OBJECT_TYPES } from '../../../../shared/constants/index'
import { connect } from 'react-redux'
import Spinner from '../../_shared/Spinner/spinner.component'
import './searchCategory.scss'
import { PLAYLISTS } from '../../../../shared/constants'
import TracksGrid from '../../_shared/TracksGrid/tracksGrid.component'
import { denormalize, schema } from 'normalizr'
import playlistSchema from '../../../../shared/schemas/playlist'
import { userSchema } from '../../../../shared/schemas'
import trackSchema from '../../../../shared/schemas/track'

class SearchCategory extends React.PureComponent {
    state = {
        loading: false
    }

    componentDidMount() {
        const { query, search, playlist_object, object_id } = this.props

        if (!playlist_object && query && query.length) {

            this.setState({
                loading: true
            })
            search(object_id, query, 40)
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
            search(object_id, nextProps.query, 40)
                .then(() => {
                    this.setState({
                        loading: false
                    })
                })
        }
    }

    hasMore = () => {
        const { object_id } = this.props
        return this.props.canFetchMoreOf(object_id, OBJECT_TYPES.PLAYLISTS)
    }

    loadMore = () => {
        const { object_id } = this.props

        if (this.props.canFetchMoreOf(object_id, OBJECT_TYPES.PLAYLISTS)) {
            this.props.fetchMore(object_id, OBJECT_TYPES.PLAYLISTS)
        }
    }

    render() {
        const {
            player,
            entities,
            auth: { likes, reposts, followings },
            results,
            toggleLike,
            toggleRepost,
            fetchPlaylistIfNeeded,
            toggleFollowing,
            playTrack,
            show,
            addUpNext,
            playlist_object,
            object_id
        } = this.props

        if (this.state.loading) {
            return <Spinner />
        }

        return (
            <div>
                <TracksGrid likes={likes}
                            items={results}
                            followings={followings}
                            toggleFollowing={toggleFollowing}
                            reposts={reposts}
                            player={player}
                            playlist_name={object_id}
                            showInfo
                            entities={entities}
                            toggleLike={toggleLike}
                            toggleRepost={toggleRepost}
                            show={show}
                            addUpNext={addUpNext}
                            playTrackFunc={playTrack}
                            fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded}
                />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { auth, entities, objects, player: { playingTrack }, app, player } = state
    const { match: { params } } = props

    const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}

    let object_id

    switch (params.category) {
        case 'user':
            object_id = PLAYLISTS.SEARCH_USER
            break
        case 'playlist':
            object_id = PLAYLISTS.SEARCH_PLAYLIST
            break
        case 'track':
            object_id = PLAYLISTS.SEARCH_TRACK
            break
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