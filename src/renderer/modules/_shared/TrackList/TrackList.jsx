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
            hideFirstTrack,
            player,
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

                                return (
                                    <TrackListItem
                                        key={`track-list-${track.id}`}
                                        track={track}
                                        isPlaying={track.id === player.playingTrack.id}

                                        playTrackFunc={this.playTrack.bind(this, track.id)}
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
    items: PropTypes.array.isRequired,
    player: PropTypes.object.isRequired,
    hideFirstTrack: PropTypes.bool,

    playTrackFunc: PropTypes.func.isRequired

}

TrackList.defaultProps = {
    hideFirstTrack: false
}

export default TrackList
