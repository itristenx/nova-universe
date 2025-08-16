import React from 'react';

export const TestDashboard: React.FC = () => {
  console.log('🧪 TestDashboard rendering...');

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold text-blue-900">🧪 Test Dashboard - Nova Pulse</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Basic Functionality Test</h2>
          <p className="mb-4 text-gray-600">
            This is a simple test component to verify that React is rendering properly.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-green-100 p-4">
              <h3 className="font-semibold text-green-800">✅ React Working</h3>
              <p className="text-green-600">Component rendering successfully</p>
            </div>

            <div className="rounded-lg bg-yellow-100 p-4">
              <h3 className="font-semibold text-yellow-800">🎨 CSS Working</h3>
              <p className="text-yellow-600">Tailwind styles applying</p>
            </div>

            <div className="rounded-lg bg-purple-100 p-4">
              <h3 className="font-semibold text-purple-800">🚀 JS Working</h3>
              <p className="text-purple-600">JavaScript executing</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Timestamp:</strong> {new Date().toISOString()}
            </p>
            <p>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
            <p>
              <strong>URL:</strong> {window.location.href}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
