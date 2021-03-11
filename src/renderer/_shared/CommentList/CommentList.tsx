import { Normalized } from '@types';
import React, { useRef } from 'react';
import ReactList from 'react-list';
import Spinner from '../Spinner/Spinner';
import CommentListItem from './CommentListItem/CommentListitem';
import { InfiniteScroll } from '../InfiniteScroll';

interface Props {
  items: Normalized.NormalizedResult[];

  // Infinite loading
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?(): Promise<void>;
}

export const CommentList: React.SFC<Props> = ({ isLoading = false, loadMore, items = [], hasMore = false }) => {
  function renderItem(index: number) {
    const item = items[index];

    return <CommentListItem key={`comment-${item.id}`} idResult={item} />;
  }

  return (
    <div className="comments">
      <InfiniteScroll hasMore={hasMore} isFetching={isLoading} loadMore={loadMore}>
        <ReactList pageSize={8} type="simple" length={items.length} itemRenderer={renderItem} useTranslate3d />
        {isLoading && <Spinner />}
      </InfiniteScroll>
    </div>
  );
};
