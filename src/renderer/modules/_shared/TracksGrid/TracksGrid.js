import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactList from 'react-list'
import TrackGridItem from './TrackGridItem'
import cn from 'classnames'
import * as SC from '../../../../shared/utils/soundcloudUtils'
import TrackGridUser from './TrackGridUser'

class TracksGrid extends Component {

    renderItem = (index, key) => {

        const {
            // Vars
            entities: { playlist_entities },
            showInfo,
            playlist_name,
            followings,
            player,
            likes,
            reposts,
            items,

            // Functions
            playTrackFunc,
            fetchPlaylistIfNeededFunc,
            toggleFollowing,
            show,
            toggleLike,
            toggleRepost,
            addUpNext
        } = this.props


        const item = items[index]

        if (!item || typeof item !== 'object' || Object.keys(item) === ['id', 'kind']) {
            return null
        }

        let obj = item

        let repost = false

        if (item.info) {

            if (item.info.user) {
                item.from_user = item.info.user
            }

            if (item.info.type.split('-')[1] === 'repost') {
                repost = true
            }

        }

        let newplayTrackFunc = playTrackFunc.bind(null, playlist_name, obj.id, obj.kind === 'playlist' ? obj : null, true)

        const liked = SC.hasID(obj.id, (obj.kind === 'playlist' ? likes.playlist : likes.track))
        const reposted = SC.hasID(obj.id, reposts)

        let isPlaying

        if (obj.kind === 'playlist') {
            isPlaying = player.playingTrack.playlistId === obj.id
        } else {
            isPlaying = player.playingTrack.id === obj.id && player.playingTrack.playlistId === player.currentPlaylistId
        }

        if (obj.kind === 'user') {
            const following = SC.hasID(obj.id, followings)

            return (
                <TrackGridUser
                    following={following}
                    toggleFollowingFunc={toggleFollowing.bind(null, obj.id)}
                    key={`grid-item-${obj.kind}-${obj.id}`}
                    user={obj} />
            )
        }

        if (!obj.user) return null

        return (
            <TrackGridItem
                key={`grid-item-${obj.kind}-${obj.id}`}
                playlist_exists={!!playlist_entities[obj.id]}
                playlist={obj.kind === 'playlist'}
                showInfo={showInfo}
                liked={liked}
                reposted={reposted}
                repost={repost}
                isPlaying={isPlaying}
                track={obj}

                toggleLike={toggleLike}
                toggleRepost={toggleRepost}
                playTrackFunc={newplayTrackFunc}
                addUpNext={addUpNext}
                fetchPlaylistIfNeededFunc={fetchPlaylistIfNeededFunc.bind(null, obj.id)}
                show={show} />
        )
    }

    renderWrapper(items, ref) {
        return <div className="row" ref={ref}>{items}</div>
    }

    render() {

        const { items } = this.props

        return (
            <div className={cn('songs container-fluid')}>
                <ReactList
                    pageSize={25}
                    type="uniform"
                    length={items.length}
                    itemsRenderer={this.renderWrapper}
                    itemRenderer={this.renderItem}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        )
    }
}

TracksGrid.propTypes = {
    showInfo: PropTypes.bool,
    noPadding: PropTypes.bool,
    sort: PropTypes.bool,
    entities: PropTypes.object.isRequired,
    items: PropTypes.array,
    player: PropTypes.object.isRequired,
    likes: PropTypes.object.isRequired,
    followings: PropTypes.object,
    reposts: PropTypes.object.isRequired,
    playlist_name: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]),

    playTrackFunc: PropTypes.func.isRequired,
    fetchPlaylistIfNeededFunc: PropTypes.func.isRequired,
    toggleFollowing: PropTypes.func,
    show: PropTypes.func.isRequired,
    toggleLike: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired
}

TracksGrid.defaultProps = {
    items: []
}

export default TracksGrid
