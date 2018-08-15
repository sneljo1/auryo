import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as actions from '../../../shared/actions'
import { CHART_SORT_TYPE, PLAYLISTS } from '../../../shared/constants'
import TracksGrid from '../_shared/TracksGrid/TracksGrid'
import Spinner from '../_shared/Spinner/Spinner'
import CustomScroll from '../_shared/CustomScroll'
import { withRouter } from 'react-router-dom'
import { denormalize, schema } from 'normalizr'
import playlistSchema from '../../../shared/schemas/playlist'
import trackSchema from '../../../shared/schemas/track'
import Header from '../app/components/Header/Header'
import WithHeaderComponent from '../_shared/WithHeaderComponent'
import cn from 'classnames'
import PageHeader from '../_shared/PageHeader/PageHeader'

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

        this.fetchPlaylist(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.fetchPlaylist(nextProps)

    }

    fetchPlaylist = (props) => {
        const { playlist: playlist_object, chart, fetchChartsIfNeeded, sortType, fetchMore, object_id, object_type, getAuthLikesIfNeeded, getAuthTracksIfNeeded, getAuthAllPlaylistsIfNeeded } = props


        if (!playlist_object) {

            if (chart) {
                fetchChartsIfNeeded(object_id, sortType)
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
            auth: { followings },
            // Functions
            playTrack,
            fetchPlaylistIfNeeded,
            fetchMore,
            chart,
            sortTypeChange,
            sortType
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

                <Header className={cn({ withImage: this.props.backgroundImage })} scrollTop={this.state.scrollTop} />

                <PageHeader image={this.props.backgroundImage} gradient={this.props.gradient}>
                    {
                        chart && (
                            <div className="float-right">
                                <div className="bp3-select">
                                    <select defaultValue={sortType} value={sortType}
                                            onChange={sortTypeChange}>
                                        <option value={CHART_SORT_TYPE.TOP}>{CHART_SORT_TYPE.TOP}</option>
                                        <option value={CHART_SORT_TYPE.TRENDING}>{CHART_SORT_TYPE.TRENDING}</option>
                                    </select>
                                </div>
                            </div>
                        )
                    }
                    <h2>{title}</h2>
                </PageHeader>

                <TracksGrid
                    followings={followings}
                    items={items}
                    player={player}
                    playlist_name={object_id}
                    showInfo={showInfo}
                    entities={entities}
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
    backgroundImage: PropTypes.string,
    sortType: PropTypes.string,
    showInfo: PropTypes.bool,
    sortTypeChange: PropTypes.func
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