/**
 * Nova Universe Toast/Notification Component
 * Phase 3 Implementation - Toast notifications with design tokens
 */

import { colors, spacing, borderRadius, shadows, transitions, zIndex } from './tokens';

const toastStyles = `
/* Toast container */
.nova-toast-container {
  position: fixed;
  z-index: ${zIndex.toast};
  pointer-events: none;
}

.nova-toast-container--top-right {
  top: ${spacing[4]};
  right: ${spacing[4]};
}

.nova-toast-container--top-left {
  top: ${spacing[4]};
  left: ${spacing[4]};
}

.nova-toast-container--bottom-right {
  bottom: ${spacing[4]};
  right: ${spacing[4]};
}

.nova-toast-container--bottom-left {
  bottom: ${spacing[4]};
  left: ${spacing[4]};
}

.nova-toast-container--top-center {
  top: ${spacing[4]};
  left: 50%;
  transform: translateX(-50%);
}

.nova-toast-container--bottom-center {
  bottom: ${spacing[4]};
  left: 50%;
  transform: translateX(-50%);
}

/* Toast */
.nova-toast {
  display: flex;
  align-items: flex-start;
  gap: ${spacing[3]};
  min-width: 320px;
  max-width: 400px;
  margin-bottom: ${spacing[2]};
  padding: ${spacing[4]};
  background-color: ${colors.background};
  border: 1px solid ${colors.muted}20;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  pointer-events: auto;
  transform: translateX(100%);
  transition: all ${transitions.duration[300]} ${transitions.easing.out};
}

.nova-toast--show {
  transform: translateX(0);
}

.nova-toast--hide {
  transform: translateX(100%);
  opacity: 0;
}

/* Toast variants */
.nova-toast--success {
  border-left: 4px solid ${colors.success};
}

.nova-toast--warning {
  border-left: 4px solid ${colors.warning};
}

.nova-toast--error {
  border-left: 4px solid ${colors.error};
}

.nova-toast--info {
  border-left: 4px solid ${colors.info};
}

/* Toast icon */
.nova-toast__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.nova-toast__icon--success {
  color: ${colors.success};
}

.nova-toast__icon--warning {
  color: ${colors.warning};
}

.nova-toast__icon--error {
  color: ${colors.error};
}

.nova-toast__icon--info {
  color: ${colors.info};
}

/* Toast content */
.nova-toast__content {
  flex: 1;
  min-width: 0;
}

.nova-toast__title {
  margin: 0 0 ${spacing[1]} 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.content};
  line-height: 1.4;
}

.nova-toast__message {
  margin: 0;
  font-size: 0.875rem;
  color: ${colors.muted};
  line-height: 1.4;
}

/* Toast actions */
.nova-toast__actions {
  display: flex;
  gap: ${spacing[2]};
  margin-top: ${spacing[2]};
}

.nova-toast__action {
  padding: ${spacing[1]} ${spacing[2]};
  background: none;
  border: 1px solid ${colors.primary};
  border-radius: ${borderRadius.base};
  color: ${colors.primary};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.duration[150]} ${transitions.easing.inOut};
}

.nova-toast__action:hover {
  background-color: ${colors.primary};
  color: white;
}

.nova-toast__action--secondary {
  border-color: ${colors.muted};
  color: ${colors.muted};
}

.nova-toast__action--secondary:hover {
  background-color: ${colors.muted};
  color: white;
}

/* Toast close button */
.nova-toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${spacing[6]};
  height: ${spacing[6]};
  margin: -${spacing[1]} -${spacing[1]} 0 0;
  background: none;
  border: none;
  border-radius: ${borderRadius.base};
  color: ${colors.muted};
  cursor: pointer;
  transition: all ${transitions.duration[150]} ${transitions.easing.inOut};
}

.nova-toast__close:hover {
  background-color: ${colors.surface};
  color: ${colors.content};
}

/* Progress bar */
.nova-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: ${colors.primary};
  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
  transition: width ${transitions.duration[100]} linear;
}

.nova-toast--success .nova-toast__progress {
  background-color: ${colors.success};
}

.nova-toast--warning .nova-toast__progress {
  background-color: ${colors.warning};
}

.nova-toast--error .nova-toast__progress {
  background-color: ${colors.error};
}

.nova-toast--info .nova-toast__progress {
  background-color: ${colors.info};
}

/* Position-specific animations */
.nova-toast-container--top-left .nova-toast,
.nova-toast-container--bottom-left .nova-toast {
  transform: translateX(-100%);
}

.nova-toast-container--top-left .nova-toast--show,
.nova-toast-container--bottom-left .nova-toast--show {
  transform: translateX(0);
}

.nova-toast-container--top-left .nova-toast--hide,
.nova-toast-container--bottom-left .nova-toast--hide {
  transform: translateX(-100%);
}

.nova-toast-container--top-center .nova-toast,
.nova-toast-container--bottom-center .nova-toast {
  transform: translateY(-100%);
}

.nova-toast-container--top-center .nova-toast--show,
.nova-toast-container--bottom-center .nova-toast--show {
  transform: translateY(0);
}

.nova-toast-container--top-center .nova-toast--hide,
.nova-toast-container--bottom-center .nova-toast--hide {
  transform: translateY(-100%);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .nova-toast {
    min-width: 280px;
    max-width: calc(100vw - ${spacing[8]});
    margin-left: ${spacing[4]};
    margin-right: ${spacing[4]};
  }
  
  .nova-toast-container--top-center,
  .nova-toast-container--bottom-center {
    left: ${spacing[4]};
    right: ${spacing[4]};
    transform: none;
  }
  
  .nova-toast-container--top-center .nova-toast,
  .nova-toast-container--bottom-center .nova-toast {
    margin-left: 0;
    margin-right: 0;
  }
}
`;

// Icons for different toast types
const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = toastStyles;
  document.head.appendChild(styleElement);
}

export default function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  showProgress = true,
  actions = [],
  onClose,
  className = '',
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const timeoutRef = React.useRef(null);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    // Show toast
    setIsVisible(true);

    if (duration > 0) {
      // Start progress bar animation
      if (showProgress) {
        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgress(remaining);
        }, 16); // ~60fps
      }

      // Auto dismiss
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, showProgress]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Wait for animation
  };

  const toastClasses = [
    'nova-toast',
    `nova-toast--${type}`,
    isVisible ? 'nova-toast--show' : 'nova-toast--hide',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={toastClasses} role="alert" aria-live="polite">
      <div className={`nova-toast__icon nova-toast__icon--${type}`}>{icons[type]}</div>

      <div className="nova-toast__content">
        {title && <div className="nova-toast__title">{title}</div>}
        {message && <div className="nova-toast__message">{message}</div>}

        {actions.length > 0 && (
          <div className="nova-toast__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`nova-toast__action ${action.secondary ? 'nova-toast__action--secondary' : ''}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="nova-toast__close" onClick={handleClose} aria-label="Close notification">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M13.707 1.707A1 1 0 0012.293.293L7 5.586 1.707.293A1 1 0 00.293 1.707L5.586 7 .293 12.293a1 1 0 101.414 1.414L7 8.414l5.293 5.293a1 1 0 001.414-1.414L8.414 7l5.293-5.293z" />
        </svg>
      </button>

      {showProgress && duration > 0 && (
        <div className="nova-toast__progress" style={{ width: `${progress}%` }} />
      )}
    </div>
  );
}

// Toast Container component
export function ToastContainer({ position = 'top-right', className = '' }) {
  return (
    <div className={`nova-toast-container nova-toast-container--${position} ${className}`}>
      {/* Toasts will be rendered here */}
    </div>
  );
}
