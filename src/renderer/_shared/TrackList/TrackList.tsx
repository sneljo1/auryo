import * as React from "react";
import * as ReactList from "react-list";
import { NormalizedResult } from "../../../types";
import TrackListItem from "./TrackListItem/TrackListItem";

interface Props {
    items: NormalizedResult[];
    objectId: string;
    hideFirstTrack?: boolean;
}

class TrackList extends React.PureComponent<Props> {

    public renderItem = (index: number) => {
        const {
            items,
            objectId,
            hideFirstTrack,
        } = this.props;

        // using a spread because we don't want to unshift the original list
        const showedItems = [...items];

        if (hideFirstTrack) {
            showedItems.shift();
        }

        const item = showedItems[index];

        return (
            <TrackListItem
                key={`track-list-${item.id}`}
                currentPlaylistId={objectId}
                idResult={item}
            />
        );
    }

    public renderWrapper = (items: JSX.Element[], ref: string) => (
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
            <tbody ref={ref}>
                {items}
            </tbody>
        </table>
    )

    public render() {
        const {
            items,
            hideFirstTrack
        } = this.props;

        const length = items.length - (hideFirstTrack ? 1 : 0);

        return (
            <div className="trackList">
                <ReactList
                    pageSize={8}
                    type="simple"
                    itemsRenderer={this.renderWrapper}
                    length={length}
                    itemRenderer={this.renderItem as any}
                    useTranslate3d={true}
                    threshold={400}
                />
            </div>
        );
    }
}

export default TrackList;
