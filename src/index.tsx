import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

import { InitWasm } from './p2panda/InitWasm';
import { PandaProvider, CacheProvider } from './p2panda/contexts';
import {
  COMMENTS_SCHEMA_ID,
  ENDPOINT,
  EVENTS_SCHEMA_ID,
  PROFILES_SCHEMA_ID,
} from './constants';
import { App } from './components';

const Root = () => {
  return (
    <InitWasm>
      <CacheProvider
        cacheKeys={[EVENTS_SCHEMA_ID, COMMENTS_SCHEMA_ID, PROFILES_SCHEMA_ID]}
      >
        <PandaProvider endpoint={ENDPOINT}>
          <App />
        </PandaProvider>
      </CacheProvider>
    </InitWasm>
  );
};

const elem = document.createElement('div');
elem.classList.add('wrapper');
document.body.appendChild(elem);

const root = createRoot(elem);
root.render(<Root />);
