import { useCallback, useContext, useEffect, useState } from 'react';

import { CacheContext } from '../contexts';

import type { Doc, Paginated } from '../types';

export type CollectionHook<S> = {
  isLoading: boolean;
  documents: Doc<S>[];
  hasNextPage: boolean;
  endCursor?: string;
  reset: () => void;
};

export function useCollection<S>(
  schemaId: string,
  requestFn: () => Promise<Paginated<S>>,
): CollectionHook<S> {
  const { setCache } = useContext(CacheContext);
  const [isLoading, setIsLoading] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [documents, setDocuments] = useState<Doc<S>[]>([]);

  useEffect(() => {
    const fetchFromNode = async () => {
      setIsLoading(true);

      const result = await requestFn();
      setHasNextPage(result.hasNextPage);
      setEndCursor(result.endCursor);
      setDocuments((documents) => [...documents, ...result.documents]);

      setCache((cache) => {
        return {
          ...cache,
          [schemaId]: {
            ...cache[schemaId],
            ...result.documents.reduce((acc, document) => {
              acc[document.meta.documentId] = document;
              return acc;
            }, {}),
          },
        };
      });

      setIsLoading(false);
    };

    fetchFromNode();
  }, [schemaId, requestFn, setCache]);

  const reset = useCallback(() => {
    setEndCursor(undefined);
    setHasNextPage(false);
    setDocuments([]);
  }, []);

  return {
    isLoading,
    documents,
    hasNextPage,
    endCursor,
    reset,
  };
}
