import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

/**
 * FallbackApp - Lightweight version of the main app for development without backend
 * This allows the UI to be tested in isolation without Docker/database dependencies
 */
export default function FallbackApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Universe</h1>
          <p className="text-gray-600 mb-4">Development Mode</p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Backend services not available</p>
            <p>Start Docker services to use the full app:</p>
            <code className="block mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs">
              ./dev.sh
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
