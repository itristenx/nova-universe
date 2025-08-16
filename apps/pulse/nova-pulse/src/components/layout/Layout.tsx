import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const handler = (e: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
      const msg = e?.detail || e;
      if (msg?.type === 'kiosk_activated') {
        setBanner({ title: 'Kiosk Paired', message: `Kiosk ${msg?.data?.kioskId || ''} paired successfully` });
        setTimeout(() => setBanner(null), 5000);
      }
    };
    window.addEventListener('pulse:realtime_update', handler as any);
    return () => window.removeEventListener('pulse:realtime_update', handler as any);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        {banner && (
          <div className="mx-4 mt-2 px-4 py-2 rounded bg-green-600 text-white shadow animate-in fade-in slide-in-from-top-2">
            <div className="text-sm font-semibold">{banner.title}</div>
            <div className="text-xs opacity-90">{banner.message}</div>
          </div>
        )}
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
