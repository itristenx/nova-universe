import React from 'react';

export default function ConfigPanel({ open, onClose, config, setConfig, save }) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 w-80 bg-gray-800 text-white p-6 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button onClick={onClose} className="mb-4 text-right w-full hover:text-gray-300">
          ✖
        </button>
        <h2 className="text-lg mb-4">Configuration</h2>
        <div className="space-y-3 text-sm">
          <label className="block">
            Logo URL
            <input
              type="text"
              value={config.logoUrl || ''}
              onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
              className="mt-1 w-full px-2 py-1 rounded text-black"
            />
          </label>
          <label className="block">
            Welcome Message
            <input
              type="text"
              value={config.welcomeMessage || ''}
              onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
              className="mt-1 w-full px-2 py-1 rounded text-black"
            />
          </label>
          <label className="block">
            Help Message
            <input
              type="text"
              value={config.helpMessage || ''}
              onChange={(e) => setConfig({ ...config, helpMessage: e.target.value })}
              className="mt-1 w-full px-2 py-1 rounded text-black"
            />
          </label>
          <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded mt-2">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
