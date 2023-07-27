import { useContext } from 'react';
import { DocumentViewId, OperationFields } from 'shirokuma';

import { usePanda } from './';
import { CacheContext } from '../contexts';

export function useCreate<S>(
  schemaId: string,
): (fields: S | OperationFields) => Promise<DocumentViewId> {
  const { session, publicKey } = usePanda();
  const { setCache } = useContext(CacheContext);

  return async (fields: S | OperationFields) => {
    const viewId = await session.create(fields as OperationFields, {
      schemaId,
    });

    setCache((cache) => {
      return {
        ...cache,
        [schemaId]: {
          ...cache[schemaId],
          [viewId as string]: {
            meta: {
              documentId: viewId as string,
              viewId,
              owner: publicKey,
            },
            fields,
          },
        },
      };
    });

    return viewId;
  };
}
