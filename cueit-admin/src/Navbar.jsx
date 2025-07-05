import React, { useState } from 'react';
import axios from 'axios';
import {
  Cog6ToothIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar({
  logo,
  search,
  setSearch,
  showSearch,
  setShowSearch,
  openSettings,
  apiConnected,
  user,
  api,
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <nav className="bg-primary text-primary-content shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="Logo" className="h-[60px] w-[60px] object-contain" />}
          <span className="text-2xl font-bold tracking-tight">CueIT Admin</span>
          <span
            className={`ml-2 h-3 w-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}
            aria-label={apiConnected ? 'API connected' : 'API disconnected'}
          />
        </div>
        <div className="flex items-center gap-4 pr-2">
          {user && <span className="text-sm hidden sm:block">{user.name || user.email}</span>}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:text-gray-200"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md py-1 space-y-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    openSettings();
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.alert('CueIT Admin v1.0');
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  <InformationCircleIcon className="h-5 w-5" />
                  About
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.alert('For assistance contact IT.');
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  <QuestionMarkCircleIcon className="h-5 w-5" />
                  Help
                </button>
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    const msg = window.prompt('Send feedback');
                    if (msg) {
                      try {
                        await axios.post(`${api}/api/feedback`, { message: msg });
                        window.alert('Feedback sent');
                      } catch {
                        window.alert('Failed to send');
                      }
                    }
                  }}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  Send Feedback
                </button>
                <a
                  href={`${api}/logout`}
                  onClick={() => setShowMenu(false)}
                  className="block w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:text-gray-200"
              aria-label="Toggle Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-3 pr-6 absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-100 text-black py-1 rounded-full w-56 border border-gray-300 shadow transition-all duration-300 z-20 ${showSearch ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-2 pointer-events-none'} sm:static sm:block sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto sm:mt-0 sm:ml-2`}
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
