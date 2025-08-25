/**
 * Enhanced Mobile Layout Component - Phase 1 Implementation
 * Apple-inspired responsive design with touch optimization
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

// Utility function for classnames
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, sidebar, header, className }: MobileLayoutProps) {
  const { t } = useTranslation(['common']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white transition-transform duration-300 ease-in-out dark:bg-gray-800',
          isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          // Mobile: full height, Desktop: border
          isMobile ? 'h-full' : 'border-r border-gray-200 dark:border-gray-700',
        )}
      >
        {/* Mobile sidebar header */}
        {isMobile && (
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-nova flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <span className="text-sm font-bold">N</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('app.name')}
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label={t('closeSidebar')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">{sidebar}</div>

        {/* Mobile sidebar footer */}
        {isMobile && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              {t('common.swipeToCloseSidebar')}
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          isMobile ? 'ml-0' : 'ml-64',
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-30">
          {React.isValidElement(header) &&
            React.cloneElement(header, {
              onMenuClick: () => setIsSidebarOpen(true),
              isMobile,
              isTablet,
            } as any)}
        </div>

        {/* Page content */}
        <main className="min-h-0 flex-1">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Touch gesture indicators for mobile */}
      {isMobile && !isSidebarOpen && (
        <div className="fixed bottom-4 left-4 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
            aria-label={t('openSidebar')}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Swipe gesture handler for mobile */}
      {isMobile && (
        <MobileSwipeHandler isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}

// Mobile swipe gesture handler
interface MobileSwipeHandlerProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileSwipeHandler({ isOpen, onClose }: MobileSwipeHandlerProps) {
  useEffect(() => {
    if (!isOpen) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const deltaX = currentX - startX;

      // If swiped left more than 100px, close sidebar
      if (deltaX < -100) {
        onClose();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  return null;
}

export default MobileLayout;
