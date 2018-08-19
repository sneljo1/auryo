import React from 'react'
import PropTypes from 'prop-types'
import { SC } from '../../../../shared/utils'
import { PLAYER_STATUS } from '../../../../shared/constants'
import TrackListItem from './TrackListItem'

class TrackList extends React.PureComponent {

    playTrack(id, dbl, e) {
        const { playTrackFunc, player } = this.props

        let event = e;

        if (!event) {
            event = dbl
        }

        if (dbl) {
            event.preventDefault()
            playTrackFunc(id)
        } else if (event.target.tagName === 'TD' && (player.playingTrack.id !== id || player.status !== PLAYER_STATUS.PLAYING)) {
            playTrackFunc(id)
        }

    }

    render() {
        const {
            items,
            likes,
            reposts,
            hideFirstTrack,
            player,

            likeFunc,
            toggleRepost,
            show,
            addUpNext
        } = this.props

        return (
            <div className="table-responsive  trackList">
                <table className="table table-borderless">
                    <thead>
                        <tr className="trackListHeader">
                            <th className="row-play" />
                            <th className="row-title">
                                Title
                        </th>
                            <th className="trackArtist row-artist">
                                Artist
                        </th>
                            <th className="text-xs-center row-timer">
                                Time
                        </th>
                            <th className="trackitemActions row-actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((track, i) => {
                                if (i === 0 && hideFirstTrack) return

                                if (!track || (track && track.loading)) {
                                    console.error('no track', track)
                                    return null
                                }

                                const liked = SC.hasID(track.id, likes.track)
                                const reposted = SC.hasID(track.id, reposts)

                                return (
                                    <TrackListItem
                                        key={`track-list-${track.id}`}
                                        track={track}
                                        isPlaying={track.id === player.playingTrack.id}
                                        liked={liked}
                                        reposted={reposted}

                                        addUpNext={addUpNext}
                                        playTrackFunc={this.playTrack.bind(this, track.id)}
                                        likeFunc={likeFunc}
                                        toggleRepost={toggleRepost}
                                        show={show}
                                    />
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

TrackList.propTypes = {
    playingTrack: PropTypes.object,
    items: PropTypes.array.isRequired,
    player: PropTypes.object.isRequired,
    likes: PropTypes.object.isRequired,
    reposts: PropTypes.object.isRequired,
    hideFirstTrack: PropTypes.bool,

    likeFunc: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    playTrackFunc: PropTypes.func.isRequired

}

TrackList.defaultProps = {
    hideFirstTrack: false,
    playingTrack: {
        id: null,
        playlistId: null
    }
}

export default TrackList
