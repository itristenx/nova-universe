import React, { useState } from 'react';

export default function Navbar({
  logo,
  search,
  setSearch,
  showSearch,
  setShowSearch,
  openSettings,
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <nav className="bg-primary text-primary-content shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="Logo" className="h-[60px] w-[60px] object-contain" />}
          <span className="text-2xl font-bold tracking-tight">CueIT Admin</span>
        </div>
        <div className="flex items-center gap-4 pr-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:text-gray-200"
              aria-label="Settings"
            >
              <i className="fa-solid fa-gear" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-base-100 text-base-content rounded shadow-md py-1 space-y-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    openSettings();
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-base-200"
                >
                  <i className="fa-solid fa-gear" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.alert('CueIT Admin v1.0');
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-base-200"
                >
                  <i className="fa-solid fa-circle-info" />
                  About
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.alert('For assistance contact IT.');
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-base-200"
                >
                  <i className="fa-solid fa-question-circle" />
                  Help
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:text-gray-200"
              aria-label="Toggle Search"
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-3 pr-6 absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-base-100 text-base-content py-1 rounded-full w-56 border border-base-300 shadow transition-all duration-300 z-20 ${showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} sm:static sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto sm:mt-0 sm:ml-2`}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
