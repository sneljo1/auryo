import { PlaylistTypes } from "@common/store/objects";
import cn from "classnames";
import * as React from "react";
import * as ReactList from "react-list";
import { NormalizedResult } from "../../../types";
import TrackGridItem from "./TrackgridItem/TrackGridItem";
import TrackGridUser from "./TrackgridUser/TrackGridUser";

interface Props {
    showInfo?: boolean;
    items: NormalizedResult[];
    objectId: string;
}

class TracksGrid extends React.PureComponent<Props> {

    public renderItem = (index: number) => {
        const {
            showInfo,
            objectId,
            items
        } = this.props;


        const item = items[index];

        if (item.schema === "users") {
            return (
                <div
                    key={`grid-item-${item.schema}-${item.id}`}
                    className="userWrapper col-12 col-sm-6 col-lg-4"
                >
                    <TrackGridUser
                        withStats={true}
                        idResult={item}
                    />
                </div>
            );
        }

        const showReposts = objectId === PlaylistTypes.STREAM;

        return (
            <TrackGridItem
                showReposts={showReposts}
                key={`grid-item-${item.schema}-${item.id}`}
                showInfo={showInfo}
                idResult={item}
                currentPlaylistId={objectId}
            />
        );
    }

    public renderWrapper = (items: JSX.Element[], ref: string) => (
        <div className="row" ref={ref}>{items}</div>
    )

    public render() {
        const { items } = this.props;

        return (
            <div className={cn("songs container-fluid")}>
                <ReactList
                    pageSize={15}
                    type="uniform"
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
