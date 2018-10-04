import cn from 'classnames';
import { isEqual } from 'lodash';
import React from 'react';
import ReactList from 'react-list';
import { Col } from 'reactstrap';
import { PLAYLISTS } from '../../../../shared/constants';
import { AuthFollowing, toggleFollowing } from '../../../../shared/store/auth';
import { fetchPlaylistIfNeeded } from '../../../../shared/store/objects';
import { PlayingTrack, playTrack } from '../../../../shared/store/player';
import * as SC from '../../../../shared/utils/soundcloudUtils';
import { SoundCloud } from '../../../../types';
import TrackGridItem from './TrackGridItem';
import TrackGridUser from './TrackGridUser';

interface Props {
    showInfo?: boolean;
    items: SoundCloud.All[];
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
        } = this.props


        const item = { ...items[index] }

        console.log("TracksGrid render")

        if (!item || typeof item !== 'object' || Object.keys(item) === ['id', 'kind']) {
            return null
        }

        let isPlaying = !!playingTrack;

        if (playingTrack) {
            if (item.kind === 'playlist') {
                isPlaying = playingTrack.playlistId === item.id.toString()
            } else {
                isPlaying = playingTrack.id === item.id && playingTrack.playlistId === currentPlaylistId
            }
        }

        if (item.kind === 'user') {
            const following = SC.hasID(item.id, followings)

            return (
                <Col key={`grid-item-${item.kind}-${item.id}`}
                    xs="12" sm="6" lg="4"
                    className="userWrapper">
                    <TrackGridUser
                        withStats
                        isFollowing={following}
                        toggleFollowingFunc={() => {
                            if (toggleFollowing) {
                                toggleFollowing(item.id)
                            }
                        }}
                        user={item} />
                </Col>
            )
        }

        const musicAsset = item as SoundCloud.Music;

        if (!musicAsset.user) return null

        return (
            <TrackGridItem
                showReposts={objectId === PLAYLISTS.STREAM}
                key={`grid-item-${musicAsset.kind}-${musicAsset.id}`}
                showInfo={showInfo}
                isPlaying={isPlaying}
                track={musicAsset}
                playTrackFunc={() => {
                    playTrack(objectId, { id: musicAsset.id }, true)
                }}
                fetchPlaylistIfNeededFunc={() => {
                    if (musicAsset.kind === "playlist") {
                        fetchPlaylistIfNeeded(musicAsset.id)
                    }
                }}
            />
        )
    }

    renderWrapper = (items: JSX.Element[], ref: string) => (
        <div className="row" ref={ref}>{items}</div>
    )

    render() {
        const { items } = this.props

        return (
            <div className={cn('songs container-fluid')}>
                <ReactList
                    pageSize={25}
                    type="uniform"
                    length={items.length}
                    itemsRenderer={this.renderWrapper}
                    itemRenderer={this.renderItem as any}
                    useTranslate3d
                    threshold={400}
                />
            </div>
        )
    }
}

export default TracksGrid
