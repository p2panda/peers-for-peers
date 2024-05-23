import React, { Fragment } from 'react';

import { Comments, Reactions } from './';

import type { Doc } from '../p2panda/types';
import type { Event } from '../types';

type Props = {
  selected: Doc<Event>;
};

export const Details = ({ selected }: Props) => {
  return (
    <Fragment>
      <div className="detail">
        <h3 className="detail-title">Reactions</h3>
        <Reactions selected={selected} />
      </div>
      <div className="detail">
        <h3 className="detail-title">Comments</h3>
        <Comments key={selected.meta.documentId} selected={selected} />
      </div>
      <div className="detail">
        <h3 className="detail-title">Fun!</h3>
        <div className="fun nowrap">
          Document ID: <code>{selected.meta.documentId}</code>
        </div>
        <div className="fun nowrap">
          View ID: <code>{selected.meta.viewId}</code>
        </div>
        <div className="fun nowrap">
          Public Key: <code>{selected.meta.owner}</code>
        </div>
      </div>
    </Fragment>
  );
};
