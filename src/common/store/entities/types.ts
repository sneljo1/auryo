import { Normalized, SoundCloud } from '../../../types';

export interface EntitiesState extends Readonly<{
    playlistEntities: {
        [playlistId: number]: Normalized.Playlist
    },
    trackEntities: {
        [trackId: number]: Normalized.Track
    },
    userEntities: {
        [userId: number]: SoundCloud.User
    },
    commentEntities: {
        [commentId: number]: SoundCloud.Comment
    }
}> { }
