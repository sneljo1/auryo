import { useEffect, useRef, useCallback } from 'react';
import { usePrevious } from 'react-use';

export const useLoadMorePromise = (
  isFetching: boolean | undefined,
  loadMoreFunction: Function,
  dependencies: any[] = []
) => {
  const resolverRef = useRef<Function>();
  const previous = usePrevious(isFetching);

  useEffect(() => {
    if (previous && !isFetching && resolverRef.current) {
      resolverRef.current();
      resolverRef.current = undefined;
    }
  }, [isFetching, previous]);

  const loadMore = useCallback(() => {
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
      loadMoreFunction();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreFunction, ...dependencies]);

  return { loadMore };
};
