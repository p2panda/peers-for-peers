import React from 'react';
import clsx from 'clsx';

import { EventItem } from './';

import type { Doc } from '../p2panda/types';
import type { Event } from '../types';

type Props = {
  events: Doc<Event>[];
  selected?: Doc<Event>;
  onSelect: (event: Doc<Event> | undefined) => void;
};

export const EventsList = ({ events, selected, onSelect }: Props) => {
  return events.map((event) => {
    const handleSelect = () => {
      if (event === selected) {
        onSelect(undefined);
      } else {
        onSelect(event);
      }
    };

    return (
      <div
        onClick={handleSelect}
        className={clsx('event', {
          'event-selected':
            selected && selected.meta.documentId === event.meta.documentId,
        })}
        key={event.meta.documentId}
      >
        <EventItem documentId={event.meta.documentId} />
      </div>
    );
  });
};
