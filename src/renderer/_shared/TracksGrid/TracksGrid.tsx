import cn from "classnames";
import { autobind } from "core-decorators";
import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { compose } from "redux";
import { NormalizedResult } from "../../../types";
import { InjectedContentContextProps, withContentContext } from "../context/contentContext";
import Spinner from "../Spinner/Spinner";
import { TrackGridRow } from "./TrackGridRow";
import * as styles from "./TracksGrid.module.scss";

interface OwnProps {
    showInfo?: boolean;
    items: NormalizedResult[];
    objectId: string;


    hasMore?: boolean;
    isLoading?: boolean;

    isItemLoaded?(index: number): boolean;
    loadMore?(startIndex: number, stopIndex: number): Promise<void>
}

type AllProps = OwnProps & InjectedContentContextProps;

@autobind
class TracksGrid extends React.PureComponent<AllProps> {

    public static defaultProps: Partial<AllProps> = {
        isItemLoaded: () => true,
        loadMore: () => Promise.resolve(),
    };

    private readonly loader: React.RefObject<InfiniteLoader> = React.createRef();

    public componentDidMount() {
        this.props.setList(() => {
            if (this.loader.current) {
                return this.loader.current._listRef;
            }

            return null;
        });
    }

    public render() {
        const { items, objectId, showInfo, isItemLoaded, loadMore, hasMore, isLoading } = this.props;

        return (
            <>
                <div className={cn("songs container-fluid")} style={{ height: "100%" }}>
                    <AutoSizer disableHeight>
                        {({ width }: { width: number }) => {
                            const itemsPerRow = this.getRowsForWidth(width);
                            const rowCount = Math.ceil(items.length / itemsPerRow);

                            // If there are more items to be loaded then add an extra row to hold a loading indicator.
                            const itemCount = hasMore ? rowCount + 1 : rowCount;

                            // Only load 1 page of items at a time.
                            // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
                            const loadMoreItems = isLoading || !hasMore ? () => { } : loadMore;

                            return (
                                <InfiniteLoader
                                    ref={this.loader}
                                    isItemLoaded={(index: number) => {
                                        if (isItemLoaded) {
                                            isItemLoaded(index * itemsPerRow);
                                        }
                                    }}
                                    threshold={5}
                                    itemCount={itemCount}
                                    loadMoreItems={(start, end) => {
                                        if (loadMoreItems && items.length - (end * itemsPerRow) < 5) {
                                            loadMoreItems(start, end);
                                        }
                                    }}
                                >
                                    {({ onItemsRendered, ref }: any) => (
                                        <>
                                            <List
                                                style={{ height: "100%", overflow: "initial" }}
                                                ref={ref}
                                                height={window.innerHeight}
                                                itemCount={itemCount}
                                                onItemsRendered={onItemsRendered}
                                                itemData={{
                                                    itemsPerRow,
                                                    items,
                                                    objectId,
                                                    showInfo
                                                }}
                                                itemSize={350}
                                                width={width}
                                            >
                                                {TrackGridRow}
                                            </List>

                                            {
                                                isLoading && (
                                                    <div className={styles.loadingWrapper} style={{ width: `${width}px` }}>
                                                        <Spinner />
                                                    </div>
                                                )
                                            }
                                        </>
                                    )}
                                </InfiniteLoader>
                            );
                        }}
                    </AutoSizer>
                </div>
            </>
        );
    }

    private getRowsForWidth(width: number): number {
        return Math.floor(width / 255);
    }
}

export default compose(
    withContentContext,
)(TracksGrid);
