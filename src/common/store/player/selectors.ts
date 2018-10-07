import { StoreState } from '..';
import { createSelector } from 'reselect';
import { PlayerState, PlayingTrack } from './types';
import { NormalizedResult } from '../../../types';

export const getPlayer = (state: StoreState) => state.player;

export const getPlayingTrack = createSelector<StoreState, PlayerState, PlayingTrack | null>(
    [getPlayer],
    (player) => player.playingTrack
);

export const isPlaying = (result: NormalizedResult, playlistId: string) => createSelector<StoreState, PlayingTrack | null, boolean>(
    [getPlayingTrack],
    (playingTrack) => {
        if (!playingTrack) return false;

        if (result.schema === 'playlists') {
            return playingTrack.playlistId === result.id.toString();
        }

        return playingTrack.id === result.id && playingTrack.playlistId === playlistId;
    }
);
