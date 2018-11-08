import cn from 'classnames';
import * as React from 'react';
import * as ReactList from 'react-list';
import { NormalizedResult } from '../../../types';
import TrackGridItem from './TrackgridItem/TrackGridItem';
import TrackGridUser from './TrackgridUser/TrackGridUser';
import { PlaylistTypes } from '../../../common/store/objects';

interface Props {
    showInfo?: boolean;
    items: Array<NormalizedResult>;
    objectId: string;
}

class TracksGrid extends React.PureComponent<Props> {

    renderItem = (index: number) => {
        const {
            showInfo,
            objectId,
            items
        } = this.props;


        const item = items[index];

        if (item.schema === 'users') {
            return (
                <div
                    key={`grid-item-${item.schema}-${item.id}`}
                    className='userWrapper col-12 col-sm-6 col-lg-4'
                >
                    <TrackGridUser
                        withStats={true}
                        idResult={item}
                    />
                </div>
            );
        }

        return (
            <TrackGridItem
                showReposts={objectId === PlaylistTypes.STREAM}
                key={`grid-item-${item.schema}-${item.id}`}
                showInfo={showInfo}
                idResult={item}
                currentPlaylistId={objectId}
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
                    pageSize={15}
                    type='uniform'
                    length={items.length}
                    itemsRenderer={this.renderWrapper}
                    itemRenderer={this.renderItem}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        );
    }
}

export default TracksGrid;
