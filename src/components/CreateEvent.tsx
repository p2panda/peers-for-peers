import React, { ChangeEvent, FormEvent, useState } from 'react';
import { DateTime } from 'luxon';
import { DocumentViewId } from 'shirokuma';

import { useCreate } from '../p2panda/hooks';
import { EVENTS_SCHEMA_ID, MAX_DATE, MIN_DATE } from '../constants';

import type { Event } from '../types';

const initialValues = () => {
  return {
    title: '',
    location: '',
    date: DateTime.now().toFormat('yyyy-MM-dd'),
    time: DateTime.now().toFormat('HH:mm'),
    description: '',
  };
};

type Props = {
  onCreated: (viewId: DocumentViewId) => void;
};

export const CreateEvent = ({ onCreated }: Props) => {
  const [values, setValues] = useState(initialValues());
  const createEvent = useCreate<Event>(EVENTS_SCHEMA_ID);

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

  const isInvalid = Object.keys(values).some((key) => !values[key]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isInvalid) {
      return;
    }

    const { title, location, description, date, time } = values;
    const viewId = await createEvent({
      title,
      location,
      description,
      created_at: DateTime.now().toMillis(),
      happening_at: DateTime.fromISO(`${date}T${time}`).toMillis(),
    });

    setValues(initialValues());
    onCreated(viewId);
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
        <button disabled={isInvalid} className="button" type="submit">
          Create
        </button>
      </fieldset>
    </form>
  );
};
