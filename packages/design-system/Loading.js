/**
 * Nova Universe Loading/Spinner Component
 * Phase 3 Implementation - Loading states with design tokens
 */

import { colors, spacing, borderRadius, transitions } from './tokens';

const loadingStyles = `
/* Spinner */
.nova-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.muted}40;
  border-radius: 50%;
  border-top: 2px solid ${colors.primary};
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Spinner sizes */
.nova-spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

.nova-spinner--lg {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.nova-spinner--xl {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

/* Spinner variants */
.nova-spinner--primary {
  border-top-color: ${colors.primary};
}

.nova-spinner--secondary {
  border-top-color: ${colors.secondary};
}

.nova-spinner--accent {
  border-top-color: ${colors.accent};
}

.nova-spinner--white {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

/* Skeleton loader */
.nova-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    ${colors.surface} 25%,
    ${colors.muted}20 50%,
    ${colors.surface} 75%
  );
  background-size: 200% 100%;
  border-radius: ${borderRadius.base};
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton shapes */
.nova-skeleton--text {
  height: 1em;
  margin: 0.25em 0;
}

.nova-skeleton--title {
  height: 1.5em;
  margin: 0.5em 0;
}

.nova-skeleton--avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.nova-skeleton--avatar-sm {
  width: 32px;
  height: 32px;
}

.nova-skeleton--avatar-lg {
  width: 48px;
  height: 48px;
}

.nova-skeleton--button {
  height: 2.5rem;
  width: 100px;
  border-radius: ${borderRadius.md};
}

.nova-skeleton--card {
  height: 200px;
  border-radius: ${borderRadius.lg};
}

/* Loading overlay */
.nova-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);
  z-index: 999;
}

.nova-loading-overlay--dark {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

/* Loading overlay content */
.nova-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[3]};
  padding: ${spacing[6]};
  background-color: ${colors.background};
  border-radius: ${borderRadius.lg};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nova-loading-content--minimal {
  background: none;
  box-shadow: none;
  padding: ${spacing[4]};
}

.nova-loading-text {
  font-size: 0.875rem;
  color: ${colors.content};
  text-align: center;
  margin: 0;
}

.nova-loading-overlay--dark .nova-loading-text {
  color: white;
}

/* Progress bar */
.nova-progress {
  width: 100%;
  height: 8px;
  background-color: ${colors.surface};
  border-radius: ${borderRadius.full};
  overflow: hidden;
}

.nova-progress__bar {
  height: 100%;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.full};
  transition: width ${transitions.duration[300]} ${transitions.easing.out};
}

.nova-progress--sm {
  height: 4px;
}

.nova-progress--lg {
  height: 12px;
}

/* Progress variants */
.nova-progress--success .nova-progress__bar {
  background-color: ${colors.success};
}

.nova-progress--warning .nova-progress__bar {
  background-color: ${colors.warning};
}

.nova-progress--error .nova-progress__bar {
  background-color: ${colors.error};
}

/* Indeterminate progress */
.nova-progress--indeterminate .nova-progress__bar {
  width: 30% !important;
  background: linear-gradient(
    90deg,
    transparent,
    ${colors.primary},
    transparent
  );
  animation: progressIndeterminate 1.5s infinite;
}

@keyframes progressIndeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

/* Dots loader */
.nova-dots {
  display: inline-flex;
  gap: ${spacing[1]};
}

.nova-dots__dot {
  width: 6px;
  height: 6px;
  background-color: ${colors.primary};
  border-radius: 50%;
  animation: dotPulse 1.4s infinite ease-in-out;
}

.nova-dots__dot:nth-child(1) { animation-delay: -0.32s; }
.nova-dots__dot:nth-child(2) { animation-delay: -0.16s; }
.nova-dots__dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse loader */
.nova-pulse {
  width: 40px;
  height: 40px;
  background-color: ${colors.primary};
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Disable animations for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nova-spinner,
  .nova-skeleton,
  .nova-progress--indeterminate .nova-progress__bar,
  .nova-dots__dot,
  .nova-pulse {
    animation: none;
  }
  
  .nova-skeleton {
    background: ${colors.surface};
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = loadingStyles;
  document.head.appendChild(styleElement);
}

// Spinner component
export function Spinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) {
  const spinnerClasses = [
    'nova-spinner',
    `nova-spinner--${size}`,
    `nova-spinner--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={spinnerClasses} role="status" aria-label="Loading" />;
}

// Skeleton component
export function Skeleton({ 
  variant = 'text',
  width,
  height,
  className = '',
  ...props 
}) {
  const skeletonClasses = [
    'nova-skeleton',
    `nova-skeleton--${variant}`,
    className
  ].filter(Boolean).join(' ');

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div 
      className={skeletonClasses}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

// Loading overlay component
export function _LoadingOverlay({ 
  isLoading = true,
  text,
  variant = '_light',
  minimal = false,
  children,
  className = ''
}) {
  if (!isLoading) return children;

  const overlayClasses = [
    'nova-loading-overlay',
    variant === 'dark' ? 'nova-loading-overlay--dark' : '',
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'nova-loading-content',
    minimal ? 'nova-loading-content--minimal' : ''
  ].filter(Boolean).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div className={overlayClasses}>
        <div className={contentClasses}>
          <Spinner variant={variant === 'dark' ? 'white' : 'primary'} />
          {text && <p className="nova-loading-text">{text}</p>}
        </div>
      </div>
    </div>
  );
}

// Progress bar component
export function Progress({ 
  value = 0, 
  max = 100,
  size = 'md',
  variant = 'primary',
  indeterminate = false,
  className = '',
  ...props 
}) {
  const progressClasses = [
    'nova-progress',
    `nova-progress--${size}`,
    `nova-progress--${variant}`,
    indeterminate ? 'nova-progress--indeterminate' : '',
    className
  ].filter(Boolean).join(' ');

  const percentage = indeterminate ? 100 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div 
      className={progressClasses}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin="0"
      aria-valuemax={max}
      {...props}
    >
      <div 
        className="nova-progress__bar"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Dots loader component
export function _DotsLoader({ variant = 'primary', className = '' }) {
  const dotClasses = `nova-dots__dot`;
  
  return (
    <div className={`nova-dots ${className}`} role="status" aria-label="Loading">
      <div className={dotClasses} />
      <div className={dotClasses} />
      <div className={dotClasses} />
    </div>
  );
}

// Pulse loader component
export function _PulseLoader({ className = '' }) {
  return (
    <div 
      className={`nova-pulse ${className}`} 
      role="status" 
      aria-label="Loading"
    />
  );
}

// Default export
export default Spinner;
