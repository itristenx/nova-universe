import React from 'react';

export default function Navbar({ logo }) {
  return (
    <nav className="bg-blue-600 text-white shadow-md border-b border-blue-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between relative">
        <div className="flex items-center gap-5">
          {logo && (
            <img src={logo} alt="Logo" className="h-[50px] w-[50px] object-contain" />
          )}
          <h1 className="text-xl font-semibold tracking-tight">CueIT Admin</h1>
        </div>
      </div>
    </nav>
  );
}
