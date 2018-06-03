import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { getReadableTime, SC } from '../../../../shared/utils/index'
import { IMAGE_SIZES } from '../../../../shared/constants/index'
import FallbackImage from '../FallbackImage'
import './addToPlaylistModal.scss'
import { connectModal } from 'redux-modal'

class AddToPlaylistModal extends Component {

    constructor(props) {
        super(props)

        this.renderPlaylist = this.renderPlaylist.bind(this)
    }

    renderPlaylist(playlist) {
        const { track_entities, playlist_objects, trackID, togglePlaylistTrackFunc } = this.props

        const track = track_entities[trackID]

        if (!track) return null

        const first_track = track_entities[playlist.tracks[0]]
        const url = SC.getImageUrl(first_track, IMAGE_SIZES.XSMALL)
        const items = playlist_objects[playlist.id].items || []

        const in_playlist = items.indexOf(track.id) !== -1

        const togglePlaylistTrack = togglePlaylistTrackFunc.bind(null, trackID, playlist.id)

        return (
            <div key={playlist.id} className="modal-playlist d-flex justify-content-between">
                <div className="d-flex">
                    <div>
                        <FallbackImage className="mr-2" width={50} height={50} src={url} />
                    </div>
                    <div>
                        <div className="playlist-title">{playlist.title}</div>
                        <div className="playlist-info d-flex align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="icon-disc" />
                                <span>{playlist.track_count}</span>

                            </div>
                            <div className="d-flex align-items-center">
                                <i className="icon-clock" />
                                <span>{getReadableTime(playlist.duration, true, true)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="playlist-add">
                    {playlist.sharing !== 'public' ? (
                        <i className="icon-lock" />
                    ) : null}
                    {
                        in_playlist ? (
                            <a href="javascript:void(0)" onClick={togglePlaylistTrack} className="c_btn liked">
                                <i className="icon-check" />
                                Added
                            </a>
                        ) : (
                            <a href="javascript:void(0)" onClick={togglePlaylistTrack} className="c_btn">
                                <i className="icon-add" />
                                Add to playlist
                            </a>
                        )
                    }

                </div>
            </div>
        )
    }

    render() {
        const { playlists, playlist_entities, track_entities } = this.props
        const { show, handleHide, trackID } = this.props

        const track = track_entities[trackID]

        return (
            <Modal isOpen={show} toggle={handleHide} className={this.props.className}>
                <ModalHeader toggle={handleHide}>Add to playlist</ModalHeader>
                <ModalBody>
                    <div className="modal-track d-flex">
                        <div><img src={SC.getImageUrl(track, IMAGE_SIZES.SMALL)} /></div>
                        <div>{track.title}</div>
                    </div>
                    <div className="modal-playlists">
                        {
                            playlists.map(playlistId => {
                                const playlist = playlist_entities[playlistId]

                                return this.renderPlaylist(playlist)
                            })
                        }
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}

AddToPlaylistModal.propTypes = {
    playlists: PropTypes.array.isRequired,
    playlist_entities: PropTypes.object.isRequired,
    track_entities: PropTypes.object.isRequired,
    playlist_objects: PropTypes.object.isRequired,
    togglePlaylistTrackFunc: PropTypes.func.isRequired,

    handleHide: PropTypes.func,
    show: PropTypes.bool
}

export default connectModal({ name: 'addToPlaylist' })(AddToPlaylistModal)
