import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { bindActionCreators, Dispatch } from 'redux';
import { connectModal, IModalInjectedProps } from 'redux-modal';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { togglePlaylistTrack } from '../../../../shared/store/playlist/playlist';
import { getReadableTime, SC } from '../../../../shared/utils';
import FallbackImage from '../FallbackImage';
import { StoreState } from '../../../../shared/store';
import { ObjectTypes } from '../../../../shared/store/objects';
import { SoundCloud } from '../../../../types';
import { playlistSchema, trackSchema } from '../../../../shared/schemas';
import { denormalize, schema } from 'normalizr';

interface Props {
    trackId: string;
}

interface PropsFromState {
    playlists: SoundCloud.Playlist[];
    track: SoundCloud.Track;

}

interface PropsFromDispatch {
    togglePlaylistTrack: typeof togglePlaylistTrack;
}

type AllProps = Props & PropsFromState & PropsFromDispatch & IModalInjectedProps;

class AddToPlaylistModal extends React.Component<AllProps> {

    renderPlaylist = (playlist: SoundCloud.Playlist) => {
        const { track } = this.props

        if (!track || (track && track.loading)) return null

        const first_track = playlist.tracks[0]
        const url = SC.getImageUrl(first_track, IMAGE_SIZES.XSMALL)

        const inPlaylist = playlist.tracks.find(t => t.id === track.id)

        return (
            <div key={playlist.id} className="modal-playlist d-flex justify-content-between">
                <div className="d-flex">
                    <div>
                        <FallbackImage id={playlist.id} className="mr-2" width={50} height={50} src={url} />
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

                    <a href="javascript:void(0)" onClick={() => {
                        togglePlaylistTrack(track.id, playlist.id)
                    }}
                        className="c_btn liked">
                        <i className={`icon-${inPlaylist ? "check" : "add"}`} />
                        {inPlaylist ? "Added" : "Add to playlist"}
                    </a>

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
        const { playlists, track } = this.props
        const { show, handleHide } = this.props

        return (
            <Modal isOpen={show} toggle={handleHide}>
                <ModalHeader toggle={handleHide}>Add to playlist</ModalHeader>
                <ModalBody>
                    <div className="modal-track d-flex">
                        <div><img src={SC.getImageUrl(track, IMAGE_SIZES.SMALL)} /></div>
                        <div>{track.title}</div>
                    </div>
                    <div className="modal-playlists">
                        {
                            playlists.map(this.renderPlaylist)
                        }
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}

const mapStateToProps = (state: StoreState, props: Props): PropsFromState => {
    const { auth: { playlists }, entities } = state;

    const deNormalizedPlaylists = denormalize(playlists, new schema.Array({
        playlists: playlistSchema
    }, (input) => `${input.kind}s`), entities);

    const track = denormalize(props.trackId, trackSchema, entities);

    return {
        playlists: deNormalizedPlaylists,
        track
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): PropsFromDispatch => bindActionCreators({
    togglePlaylistTrack
}, dispatch);

export default connectModal({ name: 'addToPlaylist' })(connect<PropsFromState, PropsFromDispatch, any, StoreState>(mapStateToProps, mapDispatchToProps)(AddToPlaylistModal) as any)
