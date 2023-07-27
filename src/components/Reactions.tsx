import React, { Fragment } from 'react';

import type { Doc } from '../p2panda/types';
import type { Event } from '../types';
import { useReactions } from '../hooks';

type Props = {
  selected: Doc<Event>;
};

export const Reactions = ({ selected }: Props) => {
  const { reactions, toggleReaction, myReaction } = useReactions(
    selected.meta.documentId,
  );

  return (
    <Fragment>
      <ul className="reactions">
        {new Array(reactions).fill('🏓').map((reaction, index) => {
          return <li key={index}>{reaction}</li>;
        })}
      </ul>
      <button className="button" onClick={toggleReaction}>
        {!myReaction ? 'Yay!' : 'Ney'}
      </button>
    </Fragment>
  );
};
