import * as React from 'react';
import * as ReactList from 'react-list';
import { NormalizedResult } from '../../../../types';
import TrackListItem from './TrackListItem';

interface Props {
    items: Array<NormalizedResult>;
    objectId: string;
    hideFirstTrack?: boolean;
}

class TrackList extends React.PureComponent<Props> {

    renderItem = (index: number) => {
        const {
            items,
            objectId,
        } = this.props;

        const item = items[index];

        console.log('tracklistitem render');

        return (
            <TrackListItem
                key={`track-list-${item.id}`}
                currentPlaylistId={objectId}
                idResult={item}
            />
        );
    }

    renderWrapper = (items: Array<JSX.Element>, ref: string) => (
        <table className='table table-borderless'>
            <thead>
                <tr className='trackListHeader'>
                    <th className='row-play' />
                    <th className='row-title'>
                        Title
                        </th>
                    <th className='trackArtist row-artist'>
                        Artist
                        </th>
                    <th className='text-xs-center row-timer'>
                        Time
                        </th>
                    <th className='trackitemActions row-actions' />
                </tr>
            </thead>
            <tbody ref={ref}>
                {items}
            </tbody>
        </table>
    )

    render() {
        const {
            items
        } = this.props;

        return (
            <div className='trackList'>
                <ReactList
                    pageSize={8}
                    type='simple'
                    itemsRenderer={this.renderWrapper}
                    length={items.length}
                    itemRenderer={this.renderItem as any}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        );
    }
}

export default TrackList;
