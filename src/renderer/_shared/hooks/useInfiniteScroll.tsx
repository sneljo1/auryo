import { throttle } from 'lodash';
import { useCallback, useEffect } from 'react';

export const useInfiniteScroll = (isFetching = false, loadMore?: Function, triggerFetchPos = 300) => {
  const elements = document.getElementsByClassName('content');

  if (elements.length !== 1) {
    return null;
  }

  const element: HTMLDivElement = elements[0] as any;

  const throttleOnScroll = useCallback(
    throttle(() => {
      if (
        !isFetching &&
        element.scrollTop + element.offsetHeight + triggerFetchPos >= element.scrollHeight &&
        loadMore
      ) {
        loadMore();
      }
    }),
    [isFetching]
  );

  useEffect(() => {
    element.addEventListener('scroll', throttleOnScroll);

    return () => element.removeEventListener('scroll', throttleOnScroll);
  }, [isFetching]);

  return [];
};
