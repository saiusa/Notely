import React, { useEffect, useMemo, useState } from 'react';

function IconButton({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-[#2a3042] text-[#8f77d2]' : 'text-[#f4f5fa] hover:bg-[#23283a]'
      }`}
    >
      <span className="material-symbols-outlined text-[20px] leading-none">{icon}</span>
    </button>
  );
}

function SearchBar() {
  return (
    <label className="hidden h-9 w-[208px] items-center gap-2 rounded-full bg-[#21232C] px-4 text-[#6f7689] md:flex">
      <span className="material-symbols-outlined text-[18px]">search</span>
      <input
        type="text"
        placeholder="Search Notely"
        className="w-full bg-transparent text-[15px] text-[#d4d8e6] placeholder:text-[#62697c] focus:outline-none"
      />
    </label>
  );
}

function HomeTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-14">
      <button
        type="button"
        onClick={() => onChange('explore')}
        className={`px-4 text-[20px] font-semibold transition-colors ${
          activeTab === 'explore' ? 'text-[#6750A4]' : 'text-[#8a90a6] hover:text-[#bcc2d8]'
        }`}
      >
        Explore
      </button>
      <span className="h-10 w-px bg-[#2b3041]" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onChange('community')}
        className={`px-4 text-[20px] font-semibold transition-colors ${
          activeTab === 'community' ? 'text-[#6750A4]' : 'text-[#8a90a6] hover:text-[#bcc2d8]'
        }`}
      >
        Community
      </button>
    </div>
  );
}

function FilterDropdown({ open }) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-[44px] z-50 w-[170px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] text-white shadow-xl">
      <button className="block h-8 w-full rounded px-2 text-left transition-colors hover:bg-[#2a3043]">
        Types of mood
      </button>
      <button className="block h-8 w-full rounded px-2 text-left transition-colors hover:bg-[#2a3043]">
        Most React
      </button>
      <button className="block h-8 w-full rounded px-2 text-left transition-colors hover:bg-[#2a3043]">
        Top Journal
      </button>
    </div>
  );
}

function NotificationButton({ count, active, onClick }) {
  const normalizedCount = useMemo(() => {
    if (count > 99) return '99+';
    return String(Math.max(count, 0));
  }, [count]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-[#2a3042] text-[#8f77d2]' : 'text-[#f4f5fa] hover:bg-[#23283a]'
      }`}
    >
      <span className="material-symbols-outlined text-[20px] leading-none">notifications</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[#785ebf] px-1 text-[10px] font-semibold leading-4 text-white">
          {normalizedCount}
        </span>
      )}
    </button>
  );
}

function HomeNavbar({ activeTab, onTabChange, filterOpen, setFilterOpen, notificationCount, notificationActive, onNotificationClick }) {
  return (
    <>
      <div className="flex flex-1 justify-center">
        <HomeTabs activeTab={activeTab} onChange={onTabChange} />
      </div>

      <div className="flex items-center gap-3 w-[280px] justify-end">
        <div className="relative">
          <IconButton
            icon="tune"
            label="Filter"
            active={filterOpen}
            onClick={() => setFilterOpen((prev) => !prev)}
          />
          <FilterDropdown open={filterOpen} />
        </div>
        <SearchBar />
        <NotificationButton
          count={notificationCount}
          active={notificationActive}
          onClick={onNotificationClick}
        />
      </div>
    </>
  );
}

function DefaultNavbar({ title, showBack, onBack, notificationCount, notificationActive, onNotificationClick }) {
  return (
    <>
      <div className="flex items-center gap-4 w-60 flex-shrink-0">
        {showBack && <IconButton icon="arrow_back" label="Back" onClick={onBack} />}
        <span className="text-[20px] font-semibold text-[#f4f5fa]">{title}</span>
      </div>

      <div className="flex items-center gap-3 w-[280px] justify-end">
        <SearchBar />
        <NotificationButton
          count={notificationCount}
          active={notificationActive}
          onClick={onNotificationClick}
        />
      </div>
    </>
  );
}

// ----------------- FIXED TOP NAVBAR -----------------
export default function TopNavbar({
  mode = 'tabs',
  title = 'Home',
  activeTab = 'explore',
  onTabChange = () => {},
  showBack,
  onBack,
  notificationCount = 0,
  notificationActive = false,
  onNotificationClick = () => {},
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (mode !== 'tabs') setFilterOpen(false);
  }, [mode]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    onTabChange(tab);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <>
      {/* Fixed Top Navbar */}
      <header
        className="sticky top-0 z-50 flex h-[68px] items-center border-b border-[#2b3041] bg-[#1B1C24] px-7 justify-between"
        style={{ left: '260px', right: 0 }} // <-- offset so it doesn't cover sidebar
      >
        {mode === 'tabs' ? (
          <HomeNavbar
            activeTab={currentTab}
            onTabChange={handleTabChange}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
          />
        ) : (
          <DefaultNavbar
            title={title}
            showBack={showBack}
            onBack={handleBack}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
          />
        )}
      </header>


     
    </>
  );
}