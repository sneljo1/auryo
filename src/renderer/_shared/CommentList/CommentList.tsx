import { Normalized } from '@types';
import React from 'react';
import ReactList from 'react-list';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Spinner from '../Spinner/Spinner';
import CommentListItem from './CommentListItem/CommentListitem';

interface Props {
  items: Normalized.NormalizedResult[];

  // Infinite loading
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?(): Promise<void>;
}

export const CommentList: React.SFC<Props> = ({ isLoading, loadMore, items = [], hasMore }) => {
  useInfiniteScroll(isLoading, hasMore ? loadMore : undefined);

  function renderItem(index: number) {
    const item = items[index];

    return <CommentListItem key={`comment-${item.id}`} idResult={item} />;
  }

  return (
    <div className="comments">
      <ReactList pageSize={8} type="simple" length={items.length} itemRenderer={renderItem} useTranslate3d />
      {isLoading && <Spinner />}
    </div>
  );
};
