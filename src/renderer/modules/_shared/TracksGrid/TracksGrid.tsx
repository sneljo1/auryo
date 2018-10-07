import cn from 'classnames';
import * as React from 'react';
import * as ReactList from 'react-list';
import { PLAYLISTS } from '../../../../common/constants';
import { AuthFollowing, toggleFollowing } from '../../../../common/store/auth';
import { fetchPlaylistIfNeeded } from '../../../../common/store/objects';
import { PlayingTrack, playTrack } from '../../../../common/store/player';
import * as SC from '../../../../common/utils/soundcloudUtils';
import { SoundCloud } from '../../../../types';
import TrackGridItem from './TrackGridItem';
import TrackGridUser from './TrackGridUser';

interface Props {
    showInfo?: boolean;
    items: Array<SoundCloud.All>;
    playingTrack: PlayingTrack | null;
    currentPlaylistId: string | null;
    followings: AuthFollowing;
    objectId: string;

    playTrack: typeof playTrack;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
    toggleFollowing?: typeof toggleFollowing;
}

class TracksGrid extends React.Component<Props> {

    // shouldComponentUpdate(nextProps: Props) {
    //     const { playingTrack, objectId, items, currentPlaylistId, followings } = this.props;

    //     return !isEqual(playingTrack, nextProps.playingTrack) ||
    //         !isEqual(items, nextProps.items) ||
    //         !isEqual(objectId, nextProps.objectId) ||
    //         !isEqual(followings, nextProps.followings) ||
    //         !isEqual(currentPlaylistId, nextProps.currentPlaylistId);
    // }

    renderItem = (index: number) => {
        const {
            // Vars
            showInfo,
            objectId,
            followings,
            playingTrack,
            items,
            currentPlaylistId,

            // Functions
            playTrack,
            fetchPlaylistIfNeeded,
            toggleFollowing
        } = this.props;


        const item = { ...items[index] };

        console.log('TracksGrid render');

        if (!item || typeof item !== 'object' || Object.keys(item) === ['id', 'kind']) {
            return null;
        }

        let isPlaying = !!playingTrack;

        if (playingTrack) {
            // tslint:disable-next-line:max-line-length
            isPlaying = item.kind === 'playlist' ? playingTrack.playlistId === item.id.toString() : playingTrack.id === item.id && playingTrack.playlistId === currentPlaylistId;

        }

        if (item.kind === 'user') {
            const following = SC.hasID(item.id, followings);

            return (
                <div
                    key={`grid-item-${item.kind}-${item.id}`}
                    className='userWrapper col-12 col-sm-6 col-lg-4'
                >
                    <TrackGridUser
                        withStats={true}
                        isFollowing={following}
                        toggleFollowingFunc={() => {
                            if (toggleFollowing) {
                                toggleFollowing(item.id);
                            }
                        }}
                        user={item}
                    />
                </div>
            );
        }

        const musicAsset = item as SoundCloud.Music;

        if (!musicAsset.user) return null;

        return (
            <TrackGridItem
                showReposts={objectId === PLAYLISTS.STREAM}
                key={`grid-item-${musicAsset.kind}-${musicAsset.id}`}
                showInfo={showInfo}
                isPlaying={isPlaying}
                track={musicAsset}
                playTrackFunc={() => {
                    playTrack(objectId, { id: musicAsset.id }, true);
                }}
                fetchPlaylistIfNeededFunc={() => {
                    if (musicAsset.kind === 'playlist') {
                        fetchPlaylistIfNeeded(musicAsset.id);
                    }
                }}
            />
        );
    }

    renderWrapper = (items: Array<JSX.Element>, ref: string) => (
        <div className='row' ref={ref}>{items}</div>
    )

    render() {
        const { items } = this.props;

        return (
            <div className={cn('songs container-fluid')}>
                <ReactList
                    pageSize={25}
                    type='uniform'
                    length={items.length}
                    itemsRenderer={this.renderWrapper}
                    itemRenderer={this.renderItem as any}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        );
    }
}

export default TracksGrid;
