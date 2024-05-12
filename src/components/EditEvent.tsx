import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DateTime } from 'luxon';

import { useUpdate, useDelete } from '../p2panda/hooks';
import { EVENTS_SCHEMA_ID, MAX_DATE, MIN_DATE } from '../constants';
import { useEvent } from '../hooks';

import type { Event } from '../types';

const convertValues = (fields: Event) => {
  const { title, location, description, happening_at } = fields;
  const date = DateTime.fromMillis(happening_at);

  return {
    title,
    location,
    date: date.toFormat('yyyy-MM-dd'),
    time: date.toFormat('HH:mm'),
    description,
  };
};

type Props = {
  onUpdated: (documentId: string) => void;
  onDeleted: (documentId: string) => void;
  documentId: string;
};

export const EditEvent = ({ onUpdated, onDeleted, documentId }: Props) => {
  const { document } = useEvent(documentId);
  const updateEvent = useUpdate(EVENTS_SCHEMA_ID);
  const deleteEvent = useDelete(EVENTS_SCHEMA_ID);

  const [values, setValues] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    description: '',
  });

  useEffect(() => {
    if (document) {
      setValues(convertValues(document.fields));
    }
  }, [document]);

  const isInvalid = Object.keys(values).some((key) => !values[key]);

  const diff = useMemo(() => {
    if (!document) {
      return {};
    }

    const { title, location, description, date, time } = values;
    const fields = {
      title,
      location,
      description,
      happening_at: DateTime.fromISO(`${date}T${time}`).toSeconds(),
    };

    return Object.keys(fields).reduce((acc, name) => {
      if (fields[name] !== document.fields[name]) {
        acc[name] = fields[name];
      }
      return acc;
    }, {});
  }, [values, document]);

  const isDifferent = Object.keys(diff).length > 0;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setValues((values) => {
      return {
        ...values,
        [name]: value,
      };
    });
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (window.confirm('Are you sure?')) {
      await deleteEvent(document.meta.documentId, document.meta.viewId);
      onDeleted(document.meta.documentId);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isInvalid) {
      return;
    }

    if (isDifferent) {
      await updateEvent(diff, document.meta.documentId, document.meta.viewId);
    }

    onUpdated(document.meta.documentId);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <fieldset>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          value={values.location}
          onChange={handleChange}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={values.date}
          onChange={handleChange}
        />
        &nbsp;
        <input
          id="time"
          name="time"
          type="time"
          value={values.time}
          onChange={handleChange}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          value={values.description}
          onChange={handleChange}
        />
      </fieldset>
      <fieldset>
        <button
          disabled={isInvalid || !isDifferent}
          className="button"
          type="submit"
        >
          Update
        </button>
        <button className="button" onClick={handleDelete}>
          Delete
        </button>
      </fieldset>
    </form>
  );
};
