import { isEqual } from 'lodash';
import React from 'react';
import ReactList from 'react-list';
import { PlayingTrack, playTrack } from '../../../../shared/store/player';
import { SoundCloud } from '../../../../types';
import TrackListItem from './TrackListItem';

interface Props {
    items: SoundCloud.Track[];
    playingTrack: PlayingTrack | null;
    objectId: string;
    hideFirstTrack?: boolean;

    playTrack: typeof playTrack;
}

class TrackList extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        const { playingTrack, objectId, items } = this.props;

        return !isEqual(playingTrack, nextProps.playingTrack) ||
            !isEqual(items, nextProps.items) ||
            !isEqual(objectId, nextProps.objectId);

    }

    playTrack(id: string, doubleClick: boolean, e: React.MouseEvent<any>) {
        const { playTrack, objectId } = this.props

        if (doubleClick) {
            e.preventDefault()
        }

        playTrack(objectId, { id })

    }

    renderItem = (index: number) => {
        const {
            items,
            playingTrack
        } = this.props

        const track = items[index];

        if (!track || (track && track.loading && track.error)) {
            return null
        }

        console.log("tracklistitem render")

        return (
            <TrackListItem
                key={`track-list-${track.id}`}
                track={track}
                isPlaying={!!playingTrack && track.id === playingTrack.id}
                playTrackFunc={(e, double) => {
                    this.playTrack(track.id, double || false, e)
                }}
            />
        )
    }

    renderWrapper = (items: JSX.Element[], ref: string) => (
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
            <tbody ref={ref}>{items}</tbody>
        </table>
    )

    render() {
        const {
            items
        } = this.props

        return (
            <div className="trackList">
                <ReactList
                    pageSize={8}
                    type="simple"
                    itemsRenderer={this.renderWrapper}
                    length={items.length}
                    itemRenderer={this.renderItem as any}
                    useTranslate3d
                    threshold={400}
                />
            </div>
        )
    }
}

export default TrackList
