import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Nova Pulse main.tsx loading...');

// Add global error handler for uncaught errors
window.addEventListener('error', (e) => {
  console.error('❌ Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML =
    '<div style="padding: 20px; color: red; font-family: monospace;">❌ Root element not found! Check if HTML has &lt;div id="root"&gt;&lt;/div&gt;</div>';
} else {
  console.log('✅ Root element found, mounting React app...');

  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ React root created');

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('✅ React app mounted successfully');

    // Add debug info to show React is working
    setTimeout(() => {
      if (rootElement.children.length === 0) {
        console.error('❌ React app mounted but root element is still empty!');
        rootElement.innerHTML =
          '<div style="padding: 20px; color: red; font-family: monospace;">❌ React mounted but no content rendered. Check browser console for errors.</div>';
      } else {
        console.log('✅ React app has rendered content');
      }
    }, 1000);
  } catch (error) {
    console.error('❌ Error mounting React app:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">❌ Error mounting React app: ${error}</div>`;
  }
}
