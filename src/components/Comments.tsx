import React, { ChangeEvent, FormEvent, Fragment, useState } from 'react';
import { DateTime } from 'luxon';

import { useComments, useUsername } from '../hooks';

import type { Doc } from '../p2panda/types';
import type { Comment, Event } from '../types';

type Props = {
  selected: Doc<Event>;
};

export const Comments = ({ selected }: Props) => {
  const [text, setText] = useState('');
  const { documents, hasNextPage, loadMore, createComment } = useComments(
    selected.meta.documentId,
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createComment({
      text,
      created_at: Math.round(DateTime.now().toSeconds()),
      event: selected.meta.documentId,
    });

    setText('');
  };

  return (
    <Fragment>
      {documents.map((document) => {
        return <Comment key={document.meta.documentId} comment={document} />;
      })}
      {hasNextPage && (
        <button className="button load-more" onClick={loadMore}>
          Load More
        </button>
      )}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="text">Your text</label>
          <textarea
            className="comment-textarea"
            onChange={handleChange}
            id="text"
            value={text}
          />
        </fieldset>
        <button type="submit" disabled={text.length === 0} className="button">
          Write
        </button>
      </form>
    </Fragment>
  );
};

const Comment = ({ comment }: { comment: Doc<Comment> }) => {
  const username = useUsername(comment.meta.owner);
  const date = DateTime.fromSeconds(comment.fields.created_at).toFormat(
    'dd.MM.yy HH:mm',
  );

  return (
    <div>
      <p>
        {date} by {username}
      </p>
      <p>{comment.fields.text}</p>
    </div>
  );
};
