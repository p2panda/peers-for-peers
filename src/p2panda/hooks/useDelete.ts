import { useContext } from 'react';
import { DocumentViewId } from 'shirokuma';

import { usePanda } from './';
import { CacheContext } from '../contexts';

export function useDelete(
  schemaId: string,
): (
  documentId: string,
  previousViewId: DocumentViewId,
) => Promise<DocumentViewId> {
  const { session } = usePanda();
  const { setCache } = useContext(CacheContext);

  return async (documentId: string, previousViewId: DocumentViewId) => {
    const viewId = await session.delete(previousViewId, {
      schemaId,
    });

    setCache((cache) => {
      delete cache[schemaId][documentId];
      return {
        ...cache,
        [schemaId]: {
          ...cache[schemaId],
        },
      };
    });

    return viewId;
  };
}
