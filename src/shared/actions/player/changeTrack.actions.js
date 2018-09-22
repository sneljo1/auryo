import { CHANGE_TYPES, OBJECT_TYPES, PLAYER_STATUS, REPEAT_TYPES } from '../../constants/index';
import { fetchPlaylistIfNeeded } from '../playlist.actions';
import { toggleStatus, updateTime } from "./playerActions";
import { playTrack } from './playTrack.actions';

/**
 * Change the track based on the index in the playlist
 *
 * @param changeType
 * @returns {{type, index: *}}
 */
export function changeTrack(changeType) {
    return (dispatch, getState) => {
        const {
            player,
            objects,
            entities: {
                track_entities,
                playlist_entities
            },
            config:{
                repeat
            }
        } = getState();


        const {
            currentPlaylistId,
            queue,
            currentIndex,
        } = player;

        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {};
        const currentPlaylistObject = playlists[currentPlaylistId];

        const position = currentIndex;

        let nextIndex;

        switch (changeType) {
            case CHANGE_TYPES.NEXT:
                nextIndex = position + 1;
                break;
            case CHANGE_TYPES.PREV:
                nextIndex = position - 1;
                break;
            default:
                break;
        }

        if(repeat === REPEAT_TYPES.ONE){
            nextIndex = position;
        }

        // If last song
        if (((nextIndex === queue.length && !currentPlaylistObject.nextUrl) || nextIndex === -1)) {
            if (repeat === null) {
                dispatch(toggleStatus(PLAYER_STATUS.PAUSED));
                dispatch(updateTime(0));

                return;
            }

            if (repeat === REPEAT_TYPES.ALL) {
                nextIndex = 0;
            }
        }

        if (nextIndex <= (queue.length - 1)) {
            if (nextIndex < 0) {
                nextIndex = 0;
            }

            const nextTrack = queue[nextIndex];

            if (nextTrack) {

                const trackId = nextTrack.id;
                const track = track_entities[trackId];

                // If next item in queue is NOT a track
                if (!track) {
                    const playlist = playlist_entities[nextTrack.playlistId];

                    // If playlist already exists
                    if (playlist) {
                        dispatch(playTrack(currentPlaylistId, nextTrack, playlist, null, changeType)); // just play it
                    } else {
                        return dispatch(fetchPlaylistIfNeeded(nextTrack.playlistId)) // fetch it and the tracks in it
                            .then(() => {
                                const {
                                    entities: {
                                        playlist_entities // eslint-disable-line
                                    }
                                } = getState();

                                dispatch(playTrack(currentPlaylistId, nextTrack, playlist_entities[nextTrack.playlistId], null, changeType))
                            })
                    }
                    // If this playlist is not the same as the current one playing
                } else if (nextTrack.playlistId !== currentPlaylistId) {
                    const playlist = playlist_entities[nextTrack.playlistId];
                    dispatch(playTrack(currentPlaylistId, nextTrack, playlist, null, changeType));
                } else {
                    dispatch(playTrack(currentPlaylistId, nextTrack, null, null, changeType));
                }

            }
        }

    };
}

export default changeTrack;