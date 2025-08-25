import { useEffect, useRef, useCallback, useState } from 'react';

export interface TouchGesture {
  type: 'swipe' | 'tap' | 'longpress' | 'pinch' | 'pan';
  direction?: 'left' | 'right' | 'up' | 'down';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  scale?: number;
  velocity?: number;
}

export interface TouchGestureOptions {
  swipeThreshold?: number;
  tapTimeout?: number;
  longPressTimeout?: number;
  panThreshold?: number;
  pinchThreshold?: number;
  velocityThreshold?: number;
  preventDefault?: boolean;
  disabled?: boolean;
}

export interface TouchGestureHandlers {
  onSwipeLeft?: (gesture: TouchGesture) => void;
  onSwipeRight?: (gesture: TouchGesture) => void;
  onSwipeUp?: (gesture: TouchGesture) => void;
  onSwipeDown?: (gesture: TouchGesture) => void;
  onTap?: (gesture: TouchGesture) => void;
  onLongPress?: (gesture: TouchGesture) => void;
  onPinch?: (gesture: TouchGesture) => void;
  onPan?: (gesture: TouchGesture) => void;
  onPanStart?: (gesture: TouchGesture) => void;
  onPanEnd?: (gesture: TouchGesture) => void;
}

const defaultOptions: Required<TouchGestureOptions> = {
  swipeThreshold: 50,
  tapTimeout: 300,
  longPressTimeout: 500,
  panThreshold: 10,
  pinchThreshold: 10,
  velocityThreshold: 0.3,
  preventDefault: false,
  disabled: false,
};

export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {},
) {
  const ref = useRef<HTMLElement>(null);
  const optionsRef = useRef({ ...defaultOptions, ...options });
  const handlersRef = useRef(handlers);

  const [touchState, setTouchState] = useState({
    isTracking: false,
    isPanning: false,
    startTime: 0,
    touches: [] as Touch[],
  });

  // Update refs when props change
  useEffect(() => {
    optionsRef.current = { ...defaultOptions, ...options };
    handlersRef.current = handlers;
  }, [handlers, options]);

  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const createGesture = useCallback(
    (
      type: TouchGesture['type'],
      startTouch: Touch,
      endTouch: Touch,
      duration: number,
      additionalProps: Partial<TouchGesture> = {},
    ): TouchGesture => {
      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = duration > 0 ? distance / duration : 0;

      return {
        type,
        startX: startTouch.clientX,
        startY: startTouch.clientY,
        endX: endTouch.clientX,
        endY: endTouch.clientY,
        deltaX,
        deltaY,
        distance,
        duration,
        velocity,
        ...additionalProps,
      };
    },
    [],
  );

  const getSwipeDirection = useCallback(
    (deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' => {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
      } else {
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    [],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (optionsRef.current.disabled) return;

      if (optionsRef.current.preventDefault) {
        e.preventDefault();
      }

      const touches = Array.from(e.touches);
      const now = Date.now();

      setTouchState({
        isTracking: true,
        isPanning: false,
        startTime: now,
        touches,
      });

      // Start long press timer for single touch
      if (touches.length === 1) {
        setTimeout(() => {
          setTouchState((current) => {
            if (current.isTracking && current.touches.length === 1 && !current.isPanning) {
              const gesture = createGesture(
                'longpress',
                current.touches[0],
                current.touches[0],
                Date.now() - current.startTime,
              );
              handlersRef.current.onLongPress?.(gesture);
              return { ...current, isTracking: false };
            }
            return current;
          });
        }, optionsRef.current.longPressTimeout);
      }
    },
    [createGesture],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (optionsRef.current.disabled) return;

      setTouchState((current) => {
        if (!current.isTracking) return current;

        const touches = Array.from(e.touches);

        if (touches.length === 1 && current.touches.length === 1) {
          // Single touch - check for pan
          const startTouch = current.touches[0];
          const currentTouch = touches[0];
          const deltaX = currentTouch.clientX - startTouch.clientX;
          const deltaY = currentTouch.clientY - startTouch.clientY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > optionsRef.current.panThreshold) {
            const duration = Date.now() - current.startTime;
            const gesture = createGesture('pan', startTouch, currentTouch, duration);

            if (!current.isPanning) {
              handlersRef.current.onPanStart?.(gesture);
              return { ...current, isPanning: true, touches };
            } else {
              handlersRef.current.onPan?.(gesture);
              return { ...current, touches };
            }
          }
        } else if (touches.length === 2 && current.touches.length === 2) {
          // Two touches - check for pinch
          const startDistance = getTouchDistance(current.touches[0], current.touches[1]);
          const currentDistance = getTouchDistance(touches[0], touches[1]);
          const scale = currentDistance / startDistance;

          if (Math.abs(scale - 1) > optionsRef.current.pinchThreshold / 100) {
            const duration = Date.now() - current.startTime;
            const centerStart = {
              clientX: (current.touches[0].clientX + current.touches[1].clientX) / 2,
              clientY: (current.touches[0].clientY + current.touches[1].clientY) / 2,
            } as Touch;
            const centerCurrent = {
              clientX: (touches[0].clientX + touches[1].clientX) / 2,
              clientY: (touches[0].clientY + touches[1].clientY) / 2,
            } as Touch;

            const gesture = createGesture('pinch', centerStart, centerCurrent, duration, { scale });
            handlersRef.current.onPinch?.(gesture);
          }
        }

        return { ...current, touches };
      });
    },
    [getTouchDistance, createGesture],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (optionsRef.current.disabled) return;

      setTouchState((current) => {
        if (!current.isTracking) return current;

        const now = Date.now();
        const duration = now - current.startTime;
        const remainingTouches = Array.from(e.touches);

        // Handle end of gesture
        if (remainingTouches.length === 0 && current.touches.length === 1) {
          const startTouch = current.touches[0];
          // Use the last known position from changedTouches
          const endTouch = Array.from(e.changedTouches)[0] || startTouch;

          if (current.isPanning) {
            const gesture = createGesture('pan', startTouch, endTouch, duration);
            handlersRef.current.onPanEnd?.(gesture);
          } else {
            const deltaX = endTouch.clientX - startTouch.clientX;
            const deltaY = endTouch.clientY - startTouch.clientY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (
              distance < optionsRef.current.swipeThreshold &&
              duration < optionsRef.current.tapTimeout
            ) {
              // Tap gesture
              const gesture = createGesture('tap', startTouch, endTouch, duration);
              handlersRef.current.onTap?.(gesture);
            } else if (distance >= optionsRef.current.swipeThreshold) {
              // Swipe gesture
              const direction = getSwipeDirection(deltaX, deltaY);
              const velocity = distance / duration;

              if (velocity >= optionsRef.current.velocityThreshold) {
                const gesture = createGesture('swipe', startTouch, endTouch, duration, {
                  direction,
                });

                switch (direction) {
                  case 'left':
                    handlersRef.current.onSwipeLeft?.(gesture);
                    break;
                  case 'right':
                    handlersRef.current.onSwipeRight?.(gesture);
                    break;
                  case 'up':
                    handlersRef.current.onSwipeUp?.(gesture);
                    break;
                  case 'down':
                    handlersRef.current.onSwipeDown?.(gesture);
                    break;
                }
              }
            }
          }
        }

        return {
          isTracking: false,
          isPanning: false,
          startTime: 0,
          touches: [],
        };
      });
    },
    [createGesture, getSwipeDirection],
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: !optionsRef.current.preventDefault,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: !optionsRef.current.preventDefault,
    });
    element.addEventListener('touchend', handleTouchEnd, {
      passive: !optionsRef.current.preventDefault,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref,
    isTracking: touchState.isTracking,
    isPanning: touchState.isPanning,
  };
}

// Touch gesture detection component
interface TouchGestureDetectorProps {
  children: React.ReactNode;
  className?: string;
  handlers: TouchGestureHandlers;
  options?: TouchGestureOptions;
}

export default function TouchGestureDetector({
  children,
  className = '',
  handlers,
  options,
}: TouchGestureDetectorProps) {
  const { ref } = useTouchGestures(handlers, options);

  return (
    <div ref={ref as any} className={className}>
      {children}
    </div>
  );
}

// Swipe actions component for list items
interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    color?: string;
    action: () => void;
  }>;
  rightActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    color?: string;
    action: () => void;
  }>;
  threshold?: number;
  className?: string;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className = '',
}: SwipeActionsProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handlers: TouchGestureHandlers = {
    onPan: (gesture) => {
      const offset = Math.max(-200, Math.min(200, gesture.deltaX));
      setSwipeOffset(offset);
      setIsRevealed(Math.abs(offset) > threshold);
    },
    onPanEnd: (gesture) => {
      if (Math.abs(gesture.deltaX) > threshold) {
        // Snap to revealed state
        const direction = gesture.deltaX > 0 ? 1 : -1;
        setSwipeOffset(direction * 120);
        setIsRevealed(true);
      } else {
        // Snap back to center
        setSwipeOffset(0);
        setIsRevealed(false);
      }
    },
    onTap: () => {
      if (isRevealed) {
        setSwipeOffset(0);
        setIsRevealed(false);
      }
    },
  };

  const { ref } = useTouchGestures(handlers, { panThreshold: 5 });

  const executeAction = (action: () => void) => {
    action();
    setSwipeOffset(0);
    setIsRevealed(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div
          className="absolute top-0 bottom-0 left-0 flex items-center"
          style={{
            transform: `translateX(${Math.min(0, swipeOffset - 120)}px)`,
            opacity: swipeOffset > 0 ? 1 : 0,
          }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => executeAction(action.action)}
              className={`flex h-full items-center space-x-2 px-4 font-medium text-white ${
                action.color || 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div
          className="absolute top-0 right-0 bottom-0 flex items-center"
          style={{
            transform: `translateX(${Math.max(0, swipeOffset + 120)}px)`,
            opacity: swipeOffset < 0 ? 1 : 0,
          }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => executeAction(action.action)}
              className={`flex h-full items-center space-x-2 px-4 font-medium text-white ${
                action.color || 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        ref={ref as any}
        className="relative bg-white transition-transform duration-200 dark:bg-gray-800"
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
