import { useContext, useEffect, useState } from 'react';

import { CacheContext } from '../contexts';

import type { Doc } from '../types';

export type DocumentHook<S> = {
  isLoading: boolean;
  document?: Doc<S>;
};

export function useDocument<S>(
  schemaId: string,
  documentId: string,
  requestFn: () => Promise<Doc<S>>,
): DocumentHook<S> {
  const { cache, setCache } = useContext(CacheContext);
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState<Doc<S> | undefined>();

  useEffect(() => {
    const fetchFromNode = async () => {
      setIsLoading(true);

      const result = await requestFn();
      setDocument(result);

      setCache((cache) => ({
        ...cache,
        [schemaId]: {
          ...cache[schemaId],
          [documentId]: result,
        },
      }));

      setIsLoading(false);
    };

    if (documentId in cache[schemaId]) {
      setDocument(cache[schemaId][documentId] as Doc<S>);
    } else {
      fetchFromNode();
    }
  }, [documentId, schemaId, requestFn, setCache, cache]);

  return { isLoading, document };
}
