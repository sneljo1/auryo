import { Normalized } from "@types";
import cn from "classnames";
import { autobind } from "core-decorators";
import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { compose } from "redux";
import { InjectedContentContextProps, withContentContext } from "../context/contentContext";
import Spinner from "../Spinner/Spinner";
import { TrackGridRow } from "./TrackGridRow";
import * as styles from "./TracksGrid.module.scss";

interface OwnProps {
	showInfo?: boolean;
	items: Normalized.NormalizedResult[];
	objectId: string;

	hasMore?: boolean;
	isLoading?: boolean;

	isItemLoaded?(index: number): boolean;
	loadMore?(startIndex: number, stopIndex: number): Promise<void>;
}

type AllProps = OwnProps & InjectedContentContextProps;

@autobind
class TracksGrid extends React.PureComponent<AllProps> {
	private readonly loader: React.RefObject<InfiniteLoader & { _listRef: List }> = React.createRef();
	public static defaultProps: Partial<AllProps> = {
		isItemLoaded: () => true,
		loadMore: () => Promise.resolve()
	};

	public componentDidMount() {
		const { setList } = this.props;

		setList(() => {
			if (this.loader.current) {
				// eslint-disable-next-line no-underscore-dangle
				return this.loader.current._listRef;
			}

			return null;
		});
	}

	private getRowsForWidth(width: number): number {
		return Math.floor(width / 255);
	}

	public render() {
		const { items, objectId, showInfo, isItemLoaded, loadMore, hasMore, isLoading } = this.props;

		return (
			<div className={cn("songs container-fluid")} style={{ height: "100%" }}>
				<AutoSizer disableHeight>
					{({ width }: { width: number }) => {
						const itemsPerRow = this.getRowsForWidth(width);
						const rowCount = Math.ceil(items.length / itemsPerRow);

						// If there are more items to be loaded then add an extra row to hold a loading indicator.
						const itemCount = hasMore ? rowCount + 1 : rowCount;

						// Only load 1 page of items at a time.
						// Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
						const loadMoreItems = isLoading || !hasMore ? () => Promise.resolve() : loadMore;

						return (
							<InfiniteLoader
								ref={this.loader}
								isItemLoaded={(index: number) => {
									if (isItemLoaded) {
										return isItemLoaded(index * itemsPerRow);
									}

									return true;
								}}
								threshold={5}
								itemCount={itemCount}
								loadMoreItems={(start, end) => {
									if (loadMoreItems && items.length - end * itemsPerRow < 5) {
										return loadMoreItems(start, end);
									}

									return Promise.resolve();
								}}>
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
											width={width}>
											{TrackGridRow}
										</List>

										{isLoading && (
											<div className={styles.loadingWrapper} style={{ width: `${width}px` }}>
												<Spinner />
											</div>
										)}
									</>
								)}
							</InfiniteLoader>
						);
					}}
				</AutoSizer>
			</div>
		);
	}
}

export default compose(withContentContext)(TracksGrid);
