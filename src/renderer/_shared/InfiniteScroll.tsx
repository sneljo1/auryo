import React, { FC, useEffect, useRef } from 'react';

interface Props {
  isFetching: boolean;
  hasMore: boolean;
  loadMore?: Function;
}

export const InfiniteScroll: FC<Props> = ({ isFetching, hasMore, loadMore, children }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = bottomRef.current;
    const currentObserver = new IntersectionObserver(
      entries => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && !isFetching) {
          loadMore?.();
        }
      },
      {
        root: document.getElementById('scrollContainer'),
        rootMargin: '100px',
        threshold: 1
      }
    );

    if (currentRef && hasMore) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [bottomRef, hasMore]);

  return (
    <>
      {children}
      <div ref={bottomRef} style={hasMore && !isFetching ? { height: 70 } : {}} />
    </>
  );
};
