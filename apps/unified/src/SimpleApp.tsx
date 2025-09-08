import React from 'react';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nova Universe
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Unified ITSM Platform
        </p>
        <nav className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Quick Navigation</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Dashboard
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Tickets
              </button>
              <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Assets
              </button>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Settings
              </button>
            </div>
          </div>
        </nav>
        <div className="mt-8 text-sm text-gray-500">
          This is a simplified version for testing UI components.
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;