import React from 'react';
import PostCard from '../posts/PostCard';

function toShortTimeLabel(value) {
  if (!value) return value;

  return value
    .replace(' seconds ago', 's')
    .replace(' minute ago', 'm')
    .replace(' hour ago', 'h')
    .replace(' day ago', 'd')
    .replace(' week ago', 'w')
    .replace(' month ago', 'mo');
}

export default function RecentJournals({
  journals = [],
  onClear = () => {},
}) {
  return (
    <aside className="recent-journals__sidebar">

      {/* Bento Box */}
      <div className="recent-journals__panel">

        {/* Header */}
        <div className="recent-journals__header">
          <p className="recent-journals__label">
            RECENT JOURNALS
          </p>
          <button
            type="button"
            onClick={onClear}
            className="recent-journals__clear-btn"
          >
            Clear
          </button>
        </div>

        {/* Content */}
        <div className="recent-journals__content">
          {journals.length ? (
            journals.map((entry) => (
              <PostCard
                key={entry.id}
                post={{ ...entry, time: toShortTimeLabel(entry.time) }}
                variant="recent"
              />
            ))
          ) : (
            <p className="recent-journals__empty">
              No Recent Journal&apos;s yet
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}