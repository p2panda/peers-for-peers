import { useCallback, useEffect, useState } from 'react';

import { useCollection } from './';

import type { Doc, Paginated } from '../types';

export type PaginationHook<S> = {
  isLoading: boolean;
  documents: Doc<S>[];
  hasNextPage: boolean;
  loadMore: () => void;
};

export function usePagination<S>(
  schemaId: string,
  requestFn: (endCursor: string) => Promise<Paginated<S>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[],
): PaginationHook<S> {
  const [nextEndCusor, setNextEndCursor] = useState<string | undefined>();

  const requestFnInner = useCallback(async () => {
    return await requestFn(nextEndCusor);
  }, [requestFn, nextEndCusor]);

  const { isLoading, documents, hasNextPage, endCursor, reset } = useCollection(
    schemaId,
    requestFnInner,
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage) {
      return;
    }

    setNextEndCursor(endCursor);
  }, [endCursor, hasNextPage]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    isLoading,
    documents,
    hasNextPage,
    loadMore,
  };
}
