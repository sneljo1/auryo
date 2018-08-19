import { CHANGE_TYPES, OBJECT_TYPES, PLAYER_STATUS } from '../../constants';
import { toggleStatus, updateTime } from "./playerActions";
import { fetchPlaylistIfNeeded } from '../playlist.actions';
import { playTrack } from './playTrack.actions';

/**
 * Change the track based on the index in the playlist
 *
 * @param change_type
 * @returns {{type, index: *}}
 */
export function changeTrack(change_type) {
    return (dispatch, getState) => {
        const {
            player,
            objects,
            entities: {
                track_entities,
                playlist_entities
            }
        } = getState();


        const {
            currentPlaylistId,
            queue,
            currentIndex
        } = player;

        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {};
        const currentPlaylistObject = playlists[currentPlaylistId];

        const position = currentIndex;

        let next_index;

        switch (change_type) {
            case CHANGE_TYPES.NEXT:
                next_index = position + 1;
                break;
            case CHANGE_TYPES.PREV:
                next_index = position - 1;
                break;
            default:
                break;
        }

        // Pause if last song
        if (((next_index === queue.length && !currentPlaylistObject.nextUrl) || next_index === -1)) {
            dispatch(toggleStatus(PLAYER_STATUS.PAUSED));
            dispatch(updateTime(0));
        } else if (next_index <= (queue.length - 1)) {
            if (next_index < 0) {
                next_index = 0;
            }

            const next_track = queue[next_index];


            if (next_track) {

                const trackId = next_track.id;
                const track_ent = track_entities[trackId];

                if (!track_ent) {
                    const playlist = playlist_entities[next_track.playlistId];

                    if (playlist) {
                        dispatch(playTrack(currentPlaylistId, next_track, playlist));
                    } else {
                        dispatch(fetchPlaylistIfNeeded(next_track.playlistId));
                    }
                } else if (next_track.playlistId !== currentPlaylistId) {
                    const playlist = playlist_entities[next_track.playlistId];
                    dispatch(playTrack(currentPlaylistId, next_track, playlist));
                } else {
                    dispatch(playTrack(currentPlaylistId, next_track));
                }

            }
        }

    };
}

export default changeTrack;