import React from 'react';
import PostCard from './PostCard';

function toShortTimeLabel(value) {
  if (!value) return value;

  return value
    .replace(' hour ago', 'h')
    .replace(' day ago', 'd')
    .replace(' week ago', 'w')
    .replace(' month ago', 'mo');
}

export default function RecentJournals({ journals = [], onClear = () => {} }) {
  return (
    <aside
      className="sticky top-[68px] h-fit w-full max-w-[320px] rounded-[10px] bg-[#212633] p-10"
      style={{ marginBottom: '68px' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold tracking-wide">RECENT JOURNALS</p>
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] transition-colors hover:text-[#9b84d8]"
        >
          Clear
        </button>
      </div>

      {journals.length ? (
        <div className="space-y-0">
          {journals.map((entry) => (
            <PostCard
              key={entry.id}
              post={{ ...entry, time: toShortTimeLabel(entry.time) }}
              variant="recent"
            />
          ))}
        </div>
      ) : (
        <p className="py-2 text-[14px] text-[#a7aebe]">No Recent Journal&apos;s yet</p>
      )}
    </aside>
  );
}