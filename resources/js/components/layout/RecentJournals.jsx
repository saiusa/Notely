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
    <aside className="sticky top-[100px] w-[320px] self-start bg-[#1B1C24] pl-8 pr-5 pt-0">

      {/* Bento Box */}
      <div className="flex flex-col space-y-5 rounded-[12px] bg-[#212633] p-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold tracking-wide text-white">
            RECENT JOURNALS
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] text-[#a7aebe] transition-colors hover:text-[#9b84d8]"
          >
            Clear
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {journals.length ? (
            journals.map((entry) => (
              <PostCard
                key={entry.id}
                post={{ ...entry, time: toShortTimeLabel(entry.time) }}
                variant="recent"
              />
            ))
          ) : (
            <p className="text-[14px] text-[#a7aebe]">
              No Recent Journal&apos;s yet
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}