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
  // Hacky workaround to sort the events _again_, they should come sorted from
  // the GraphQL query, but I don't have time to troubleshoot this for now :-P
  const sorted = events.sort((eventA, eventB) => {
    return eventA.fields.happening_at - eventB.fields.happening_at;
  });

  return sorted.map((event) => {
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
