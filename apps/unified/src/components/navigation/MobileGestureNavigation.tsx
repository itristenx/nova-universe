import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  TicketIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

interface MobileGestureNavigationProps {
  className?: string;
  currentPath?: string;
  navigationItems?: NavigationItem[];
  onNavigate?: (path: string) => void;
  enableGestures?: boolean;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon className="h-6 w-6" />,
    path: '/dashboard',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: <TicketIcon className="h-6 w-6" />,
    path: '/tickets',
    badge: 3,
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: <BookOpenIcon className="h-6 w-6" />,
    path: '/knowledge-base',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    path: '/settings',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon className="h-6 w-6" />,
    path: '/profile',
  },
];

export function MobileGestureNavigation({
  className,
  currentPath = '/dashboard',
  navigationItems = defaultNavigationItems,
  onNavigate,
  enableGestures = true,
}: MobileGestureNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Find current index based on path
  useEffect(() => {
    const index = navigationItems.findIndex((item) => item.path === currentPath);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentPath, navigationItems]);

  // Swipe gesture handling
  const bind = useDrag(
    ({ direction: [dx], distance: [distanceX], velocity: [velocityX], last, cancel }) => {
      if (!enableGestures) return;

      // Only process horizontal swipes with sufficient distance
      if (Math.abs(distanceX) < 50) return;

      if (last) {
        setIsDragging(false);
        const threshold = 0.3;
        const shouldSwipe = Math.abs(velocityX) > threshold || Math.abs(distanceX) > 100;

        if (shouldSwipe) {
          if (dx > 0 && currentIndex > 0) {
            // Swipe right - go to previous
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onNavigate?.(navigationItems[newIndex].path);
            setSwipeDirection('right');
            setTimeout(() => setSwipeDirection(null), 300);
          } else if (dx < 0 && currentIndex < navigationItems.length - 1) {
            // Swipe left - go to next
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onNavigate?.(navigationItems[newIndex].path);
            setSwipeDirection('left');
            setTimeout(() => setSwipeDirection(null), 300);
          }
        }

        // Reset position
        controls.start({ x: 0 });
      } else {
        setIsDragging(true);
        // Show visual feedback during drag
        controls.start({ x: distanceX * 0.3 });
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    },
  );

  const handleNavigation = useCallback(
    (path: string, index: number) => {
      setCurrentIndex(index);
      onNavigate?.(path);
      setIsMenuOpen(false);
    },
    [onNavigate],
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onNavigate?.(navigationItems[newIndex].path);
    }
  }, [currentIndex, navigationItems, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < navigationItems.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onNavigate?.(navigationItems[newIndex].path);
    }
  }, [currentIndex, navigationItems, onNavigate]);

  const currentItem = navigationItems[currentIndex];

  return (
    <div className={cn('relative', className)}>
      {/* Mobile Navigation Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 md:hidden">
        {/* Gesture Area */}
        {enableGestures && (
          <div
            ref={containerRef}
            {...bind()}
            className="absolute inset-0 z-10 touch-pan-x"
            style={{ touchAction: 'pan-x' }}
          />
        )}

        {/* Navigation Content */}
        <div className="safe-area-bottom border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          {/* Swipe Indicator */}
          {enableGestures && (
            <div className="mb-2 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-gray-300 opacity-50 dark:bg-gray-600" />
            </div>
          )}

          {/* Main Navigation */}
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={cn(
                'rounded-lg p-2 transition-colors',
                currentIndex === 0
                  ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              )}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Current Page Indicator */}
            <div key={currentItem.id} className="flex flex-1 items-center justify-center gap-3">
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200',
                  isDragging ? 'scale-95 opacity-70' : 'scale-100 opacity-100',
                  swipeDirection === 'left'
                    ? 'translate-x-2 transform'
                    : swipeDirection === 'right'
                      ? '-translate-x-2 transform'
                      : '',
                )}
              >
                <div className="text-nova-600 dark:text-nova-400">{currentItem.icon}</div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentItem.label}
                </span>
                {currentItem.badge && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                    {currentItem.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === navigationItems.length - 1}
              className={cn(
                'rounded-lg p-2 transition-colors',
                currentIndex === navigationItems.length - 1
                  ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              )}
              aria-label="Next page"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="ml-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Open navigation menu"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Page Indicators */}
          <div className="mt-2 flex justify-center gap-1">
            {navigationItems.map((_, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(navigationItems[index].path, index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-nova-600 dark:bg-nova-400 w-6'
                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500',
                )}
                aria-label={`Go to ${navigationItems[index].label}`}
              />
            ))}
          </div>

          {/* Swipe Hint */}
          {enableGestures && !isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-center"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Swipe left or right to navigate
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Full Navigation Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 bottom-0 left-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-white dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Navigation
                  </h3>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    aria-label="Close navigation menu"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="grid gap-3">
                  {navigationItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigation(item.path, index)}
                      disabled={item.disabled}
                      className={cn(
                        'flex items-center gap-4 rounded-lg p-4 text-left transition-colors',
                        currentPath === item.path
                          ? 'bg-nova-100 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300'
                          : item.disabled
                            ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                      )}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0',
                          currentPath === item.path
                            ? 'text-nova-600 dark:text-nova-400'
                            : item.disabled
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-500 dark:text-gray-400',
                        )}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {currentPath === item.path && (
                        <div className="bg-nova-600 dark:bg-nova-400 h-2 w-2 rounded-full" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 rounded-lg p-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                      <TicketIcon className="h-4 w-4" />
                      New Ticket
                    </button>
                    <button className="flex items-center gap-2 rounded-lg p-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                      <BookOpenIcon className="h-4 w-4" />
                      Search KB
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Fallback */}
      <div className="hidden md:block">
        <div className="flex items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mobile gesture navigation is available on mobile devices
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook for mobile detection
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}

// Hook for swipe gestures on any element
export function useSwipeGestures(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const bind = useDrag(
    ({ direction: [dx], distance: [distanceX], velocity: [velocityX], last }) => {
      if (!last) return;

      const threshold = 0.3;
      const shouldSwipe = Math.abs(velocityX) > threshold || Math.abs(distanceX) > 100;

      if (shouldSwipe) {
        if (dx > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    },
  );

  return bind;
}
