import React, { createContext, useState } from 'react';

import type { Doc } from '../types';

export type Cache = {
  [schemaId: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [documentId: string]: Doc<{ [name: string]: any }>;
  };
};

export const CacheContext = createContext<{
  cache: Cache;
  setCache: React.Dispatch<React.SetStateAction<Cache>>;
}>({
  cache: {},
  setCache: (previous) => {
    return previous;
  },
});

type Props = {
  children: React.ReactNode;
  cacheKeys: string[];
};

export const CacheProvider = ({ children, cacheKeys = [] }: Props) => {
  const [cache, setCache] = useState<Cache>(
    cacheKeys.reduce((acc, key) => {
      acc[key] = {};
      return acc;
    }, {}),
  );

  return (
    <CacheContext.Provider value={{ cache, setCache }}>
      {children}
    </CacheContext.Provider>
  );
};
