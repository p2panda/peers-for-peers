import { useContext } from 'react';
import { DocumentViewId, OperationFields } from 'shirokuma';

import { usePanda } from './';
import { CacheContext } from '../contexts';

export function useUpdate<S>(
  schemaId: string,
): (
  fields: Partial<S> | OperationFields,
  documentId: string,
  previousViewId: DocumentViewId,
) => Promise<DocumentViewId> {
  const { session } = usePanda();
  const { setCache } = useContext(CacheContext);

  return async (
    fields: Partial<S> | OperationFields,
    documentId: string,
    previousViewId: DocumentViewId,
  ) => {
    const viewId = await session.update(
      fields as OperationFields,
      previousViewId,
      {
        schemaId,
      },
    );

    setCache((cache) => {
      return {
        ...cache,
        [schemaId]: {
          ...cache[schemaId],
          [documentId]: {
            meta: {
              ...cache[schemaId][documentId].meta,
              viewId,
            },
            fields: {
              ...cache[schemaId][documentId].fields,
              ...fields,
            },
          },
        },
      };
    });

    return viewId;
  };
}
