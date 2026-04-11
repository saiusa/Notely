import React from 'react';

export default function JournalHeader({ visibilityTab, setVisibilityTab, sortBy, setSortBy }) {
    const [filterOpen, setFilterOpen] = React.useState(false);

    return (
        <div className="journal-header">
            {/* Visibility tabs */}
            <div className="journal-header__tabs">
                {['private', 'public'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setVisibilityTab(tab)}
                        className={`journal-header__tab ${visibilityTab === tab ? 'journal-header__tab--active' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Sort dropdown */}
            <div className="journal-header__filter">
                <button
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                    className="journal-header__filter-btn"
                    aria-label="Filter posts"
                >
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>

                {filterOpen && (
                    <div className="journal-header__filter-dropdown">
                        <button
                            type="button"
                            onClick={() => {
                                setSortBy('recent');
                                setFilterOpen(false);
                            }}
                        >
                            Recent post
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSortBy('older');
                                setFilterOpen(false);
                            }}
                        >
                            Older post
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
