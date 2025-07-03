import React from 'react';

export default function Navbar({
  logo,
  search,
  setSearch,
  showSearch,
  setShowSearch,
  openConfig,
  openKiosks,
}) {
  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />}
          <h1 className="text-lg font-semibold tracking-tight">CueIT Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={openKiosks} className="hover:text-gray-200 text-sm">Kiosks</button>
          <button onClick={openConfig} className="hover:text-gray-200 text-sm">Config</button>
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 hover:text-gray-200"
              aria-label="Toggle Search"
            >
              🔍
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-1 rounded-full w-56 transition-all duration-300 shadow ${showSearch ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
