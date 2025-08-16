import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import TabBar from './TabBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('🏗️ Layout component rendering...');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      const msg = e?.detail || e;
      if (msg?.type === 'kiosk_activated') {
        setBanner({
          title: 'Kiosk Paired',
          message: `Kiosk ${msg?.data?.kioskId || ''} paired successfully`,
        });
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
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        {banner && (
          <div className="animate-in fade-in slide-in-from-top-2 mx-4 mt-2 rounded bg-green-600 px-4 py-2 text-white shadow">
            <div className="text-sm font-semibold">{banner.title}</div>
            <div className="text-xs opacity-90">{banner.message}</div>
          </div>
        )}

        <main
          id="main-content"
          className="relative flex-1 overflow-y-auto pb-[calc(3.5rem+var(--safe-bottom))] focus:outline-none md:pb-0"
        >
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
        <TabBar />
      </div>
    </div>
  );
};
