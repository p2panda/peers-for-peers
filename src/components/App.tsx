import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  MouseEvent,
  useMemo,
  useState,
} from 'react';
import { DateTime, Duration, Interval } from 'luxon';
import clsx from 'clsx';

import { usePanda } from '../p2panda/hooks/usePanda';
import { MAX_DATE, MIN_DATE } from '../constants';
import { CreateEvent, Details, EditEvent, EventsList, Hello, Panel } from './';
import { useEvents } from '../hooks';

import type { Doc } from '../p2panda/types';
import type { Event } from '../types';

const initialPanelState = {
  create: false,
  edit: false,
  details: false,
};

function reloadPage() {
  window.location.reload();
}

export const App = () => {
  const [filter, setFilter] = useState({
    from: MIN_DATE,
    to: MAX_DATE,
    search: undefined,
  });

  const { publicKey } = usePanda();
  const { from, to, search } = filter;
  const { documents, loadMore, hasNextPage } = useEvents(from, to, search);

  const [expanded, setExpanded] = useState(initialPanelState);
  const [selected, setSelected] = useState<Doc<Event> | undefined>();
  const [searchValue, setSearchValue] = useState('');

  const noDateSelected = from === MIN_DATE && to === MAX_DATE;

  const handlePanelToggle = (id: string) => {
    setExpanded({
      ...initialPanelState,
      [id]: !expanded[id],
    });
  };

  const handleEventSelected = (event: Doc<Event>) => {
    setSelected(event);

    if (expanded.edit && event.meta.owner !== publicKey) {
      setExpanded(initialPanelState);
    }
  };

  const handleEventCreated = () => {
    setExpanded(initialPanelState);
    reloadPage();
  };

  const handleEventUpdated = () => {
    setExpanded(initialPanelState);
  };

  const handleEventDeleted = () => {
    setExpanded(initialPanelState);
    reloadPage();
  };

  const handleRefresh = () => {
    reloadPage();
  };

  const filterDates = useMemo(() => {
    const interval = Interval.fromDateTimes(
      DateTime.fromFormat(MIN_DATE, 'yyyy-MM-dd'),
      DateTime.fromFormat(MAX_DATE, 'yyyy-MM-dd').plus({ minute: 1 }),
    );

    return interval
      .splitBy(Duration.fromObject({ days: 1 }))
      .map((interval: Interval) => {
        return interval.start.toFormat('yyyy-MM-dd');
      });
  }, []);

  const handleFilter = (event: MouseEvent<HTMLButtonElement>) => {
    const target = event.target as HTMLButtonElement;
    const from = target.getAttribute('data-date');
    const to = from;

    setSearchValue('');

    if (from === filter.from && to === filter.to) {
      setFilter({
        from: MIN_DATE,
        to: MAX_DATE,
        search: undefined,
      });
    } else {
      setFilter({
        from,
        to,
        search: undefined,
      });
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchValue === filter.search) {
      setSearchValue('');

      setFilter({
        from: MIN_DATE,
        to: MAX_DATE,
        search: undefined,
      });
    } else {
      setFilter({
        from: MIN_DATE,
        to: MAX_DATE,
        search: searchValue.length > 0 ? searchValue : undefined,
      });
    }
  };

  const showEdit = selected && publicKey === selected.meta.owner;

  return (
    <Fragment>
      <header className="header">
        <Hello />
        <button
          className="button square-button refresh"
          onClick={handleRefresh}
        >
          🎡
        </button>
      </header>
      <Panel
        title="New"
        id="create"
        hidden={false}
        expanded={expanded.create}
        onToggle={handlePanelToggle}
      >
        <CreateEvent onCreated={handleEventCreated} />
      </Panel>
      <main className="main">
        <div className="filter">
          <div className="filter-group">
            {filterDates.map((date) => {
              const formatted = DateTime.fromFormat(
                date,
                'yyyy-MM-dd',
              ).toFormat('dd.MM');

              return (
                <button
                  key={date}
                  className={clsx('button', 'filter-button', {
                    'filter-button-selected': !noDateSelected && from === date,
                  })}
                  data-date={date}
                  onClick={handleFilter}
                >
                  {formatted}
                </button>
              );
            })}
          </div>
          <div className="filter-group nowrap">
            <form onSubmit={handleSearch}>
              <input
                className="filter-query"
                type="text"
                name="search"
                onChange={handleSearchChange}
                value={searchValue}
              />
              <button
                type="submit"
                className={clsx('button', 'filter-button', {
                  'filter-button-selected': search && search.length > 0,
                })}
              >
                🔬
              </button>
            </form>
          </div>
        </div>
        <EventsList
          events={documents}
          selected={selected}
          onSelect={handleEventSelected}
        />
        {hasNextPage && (
          <button className="button load-more" onClick={loadMore}>
            Load More
          </button>
        )}
      </main>
      <Panel
        title="Edit"
        id="edit"
        hidden={!showEdit}
        expanded={expanded.edit}
        onToggle={handlePanelToggle}
      >
        {showEdit && (
          <EditEvent
            documentId={selected.meta.documentId}
            onUpdated={handleEventUpdated}
            onDeleted={handleEventDeleted}
          />
        )}
      </Panel>
      <Panel
        title="Details"
        id="details"
        hidden={!selected}
        expanded={expanded.details}
        onToggle={handlePanelToggle}
      >
        {selected && <Details selected={selected} />}
      </Panel>
    </Fragment>
  );
};
