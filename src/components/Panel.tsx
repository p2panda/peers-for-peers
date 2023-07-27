import clsx from 'clsx';
import React from 'react';

type Props = {
  children: React.ReactNode;
  expanded: boolean;
  hidden: boolean;
  id: string;
  title: string;
  onToggle: (id: string) => void;
};

export const Panel = ({
  title,
  id,
  children,
  expanded,
  hidden,
  onToggle,
}: Props) => {
  return (
    <section
      className={clsx('panel', `panel-${id}`, {
        'panel-expanded': expanded,
        'panel-hidden': hidden,
      })}
    >
      <header onClick={() => onToggle(id)} className="panel-header">
        <h2>{title}</h2>
        <button
          className="button square-button panel-toggle"
          onClick={() => onToggle(id)}
        />
      </header>
      <div className="panel-content">{children}</div>
    </section>
  );
};
