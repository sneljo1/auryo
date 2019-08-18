import * as React from "react";
import * as ReactList from "react-list";
import { NormalizedResult } from "../../../types";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import Spinner from "../Spinner/Spinner";
import CommentListItem from "./CommentListItem/CommentListitem";

interface Props {
    items: NormalizedResult[];

    // Infinite loading
    hasMore?: boolean;
    isLoading?: boolean;
    loadMore?(): Promise<void>
}

export const CommentList: React.SFC<Props> = ({ isLoading, loadMore, items = [], hasMore }) => {
    useInfiniteScroll(isLoading, hasMore ? loadMore : undefined);

    function renderItem(index: number) {
        const item = items[index];

        return (
            <CommentListItem
                key={`comment-${item.id}`}
                idResult={item}
            />
        );
    }

    return (
        <div className="comments">
            <ReactList
                pageSize={8}
                type="simple"
                length={items.length}
                itemRenderer={renderItem}
                useTranslate3d={true}
            />
            {
                isLoading && <Spinner />
            }
        </div>
    );
};
