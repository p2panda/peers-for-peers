import React, { Fragment, useMemo } from 'react';
import { DateTime } from 'luxon';

import { usePanda } from '../p2panda/hooks';
import { useEvent, useUsername } from '../hooks';

type Props = {
  documentId: string;
};

export const EventItem = ({ documentId }: Props) => {
  const { publicKey } = usePanda();
  const { document } = useEvent(documentId);
  const username = useUsername(document && document.meta.owner);

  const date = useMemo(() => {
    if (!document) {
      return '';
    }

    return DateTime.fromSeconds(document.fields.happening_at).toFormat(
      'dd.MM.yy HH:mm',
    );
  }, [document]);

  return document ? (
    <Fragment>
      <h3 className="event-title">
        {publicKey === document.meta.owner ? '🏠 ' : ' '}
        {document.fields.title}
      </h3>
      <div className="event-info">
        {date} @ {document.fields.location} by {username}
      </div>
      <div className="event-description">{document.fields.description}</div>
    </Fragment>
  ) : (
    'Good bye!'
  );
};
