import React, { useState } from 'react';

export default function Navbar({
  logo,
  search,
  setSearch,
  showSearch,
  setShowSearch,
  openConfig,
  openKiosks,
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
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
              ⚙️
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white text-black rounded shadow-md">
                <button onClick={() => { setShowMenu(false); openKiosks(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Kiosk Settings</button>
                <button onClick={() => { setShowMenu(false); openConfig(); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t">Config</button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:text-gray-200"
              aria-label="Toggle Search"
            >
              🔍
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-100 text-black px-4 py-1 rounded-full w-56 border border-gray-300 shadow transition-all duration-300 z-20 ${showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
