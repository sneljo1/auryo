import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as actions from '../../../shared/actions/index'
import { PLAYLISTS } from '../../../shared/constants/index'
import TracksGrid from '../_shared/TracksGrid/TracksGrid'
import Spinner from '../_shared/Spinner/spinner.component'
import CustomScroll from '../_shared/CustomScroll'
import { withRouter } from 'react-router-dom'
import { denormalize, schema } from 'normalizr'
import playlistSchema from '../../../shared/schemas/playlist'
import trackSchema from '../../../shared/schemas/track'
import Header from '../app/components/Header/Header'
import WithHeaderComponent from '../_shared/WithHeaderComponent'

class PlayListPage extends WithHeaderComponent {

    componentDidMount() {
        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

    }

    componentDidMount() {

        if (this.props.scrollTop) {
            this.scroll.updateScrollPosition(this.props.scrollTop)
        }

        this.fetchPlaylist()
    }

    componentWillReceiveProps(nextProps) {
        this.fetchPlaylist()

    }

    fetchPlaylist = () => {
        const { playlist: playlist_object, chart, fetchChartsIfNeeded, fetchMore, object_id, object_type, getAuthLikesIfNeeded, getAuthTracksIfNeeded, getAuthAllPlaylistsIfNeeded } = this.props


        if (!playlist_object) {

            if (chart) {
                fetchChartsIfNeeded(object_id)
            } else {
                switch (object_id) {
                    case PLAYLISTS.LIKES:
                        getAuthLikesIfNeeded()
                        break
                    case PLAYLISTS.MYTRACKS:
                        getAuthTracksIfNeeded()
                        break
                    case PLAYLISTS.PLAYLISTS:
                        getAuthAllPlaylistsIfNeeded()
                        break
                }
            }

        } else if (!playlist_object || playlist_object.items.length === 0 && (playlist_object && !playlist_object.isFetching)) {
            fetchMore(object_id, object_type, chart)
        }
    }

    render() {
        const {
            entities,
            playlist_object,
            items,
            object_id,
            showInfo,
            object_type,
            title,
            player,
            auth: { likes, reposts },
            // Functions
            toggleLike,
            playTrack,
            show,
            fetchPlaylistIfNeeded,
            addUpNext,
            fetchMore,
            toggleRepost
        } = this.props

        if (!playlist_object) {
            return null
        }

        return (
            <CustomScroll heightRelativeToParent="100%"
                          heightMargin={35}
                          allowOuterScroll={true}
                          threshold={300}
                          isFetching={playlist_object.isFetching}
                          ref={r => this.scroll = r}
                          loadMore={fetchMore.bind(null, object_id, object_type)}
                          loader={<Spinner />}
                          onScroll={this.debouncedOnScroll}
                          hasMore={!!playlist_object.nextUrl}>

                <Header scrollTop={this.state.scrollTop} />

                <div className={'header ' + title.replace(' ', '_')}>
                    <h2>{title}</h2>
                </div>

                <TracksGrid likes={likes}
                            items={items}
                            reposts={reposts}
                            player={player}
                            playlist_name={object_id}
                            showInfo={showInfo}
                            entities={entities}

                            toggleLike={toggleLike}
                            toggleRepost={toggleRepost}
                            show={show}
                            addUpNext={addUpNext}
                            playTrackFunc={playTrack}
                            fetchPlaylistIfNeededFunc={fetchPlaylistIfNeeded}
                />
            </CustomScroll>
        )
    }
}

PlayListPage.propTypes = {
    object_id: PropTypes.string.isRequired,
    object_type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    showInfo: PropTypes.bool
}

const mapStateToProps = (state, props) => {
    const { auth, entities, objects, player: { playingTrack }, app, player, ui } = state
    const { object_id, object_type, location, history } = props

    const playlist_objects = objects[object_type] || {}
    const playlist_object = playlist_objects[object_id]

    let denormalized = []

    if (playlist_object) {
        denormalized = denormalize(playlist_object.items, new schema.Array({
            playlists: playlistSchema,
            tracks: trackSchema
        }, (input) => `${input.kind}s`), entities)
    }

    return {
        entities,
        auth,
        playingTrack,
        app,
        player,
        playlist_object,
        items: denormalized,
        scrollTop: history.action === 'POP' ? ui.scrollPosition[location.pathname] : undefined
    }
}

export default withRouter(connect(mapStateToProps, actions)(PlayListPage))