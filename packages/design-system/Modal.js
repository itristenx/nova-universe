/**
 * Nova Universe Modal Component
 * Phase 3 Implementation - Modal dialog with design tokens
 */

import { colors, spacing, borderRadius, shadows, zIndex, transitions } from './tokens';

const modalStyles = `
/* Modal overlay */
.nova-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing[4]};
  opacity: 0;
  transition: opacity ${transitions.duration[200]} ${transitions.easing.inOut};
}

.nova-modal-overlay--open {
  opacity: 1;
}

/* Modal container */
.nova-modal {
  background-color: ${colors.background};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows['2xl']};
  max-width: 32rem;
  width: 100%;
  max-height: calc(100vh - ${spacing[8]});
  overflow: hidden;
  transform: scale(0.95) translateY(${spacing[4]});
  transition: all ${transitions.duration[200]} ${transitions.easing.inOut};
}

.nova-modal--open {
  transform: scale(1) translateY(0);
}

/* Modal sizes */
.nova-modal--sm {
  max-width: 24rem;
}

.nova-modal--md {
  max-width: 32rem;
}

.nova-modal--lg {
  max-width: 48rem;
}

.nova-modal--xl {
  max-width: 64rem;
}

.nova-modal--full {
  max-width: calc(100vw - ${spacing[8]});
  max-height: calc(100vh - ${spacing[8]});
}

/* Modal header */
.nova-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[6]};
  border-bottom: 1px solid ${colors.muted}20;
}

.nova-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.content};
  line-height: 1.5;
}

.nova-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${spacing[8]};
  height: ${spacing[8]};
  background: none;
  border: none;
  border-radius: ${borderRadius.md};
  color: ${colors.muted};
  cursor: pointer;
  transition: all ${transitions.duration[150]} ${transitions.easing.inOut};
}

.nova-modal__close:hover {
  background-color: ${colors.surface};
  color: ${colors.content};
}

.nova-modal__close:focus {
  outline: 2px solid ${colors.primary};
  outline-offset: 2px;
}

/* Modal body */
.nova-modal__body {
  padding: ${spacing[6]};
  overflow-y: auto;
  max-height: calc(100vh - ${spacing[32]});
}

.nova-modal__body--no-padding {
  padding: 0;
}

/* Modal footer */
.nova-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing[3]};
  padding: ${spacing[6]};
  border-top: 1px solid ${colors.muted}20;
  background-color: ${colors.surface};
}

.nova-modal__footer--left {
  justify-content: flex-start;
}

.nova-modal__footer--center {
  justify-content: center;
}

.nova-modal__footer--between {
  justify-content: space-between;
}

/* Modal backdrop click prevention */
.nova-modal__content {
  pointer-events: auto;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .nova-modal-overlay {
    padding: ${spacing[2]};
    align-items: flex-end;
  }
  
  .nova-modal {
    max-height: 90vh;
    border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  }
  
  .nova-modal--full {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .nova-modal__header,
  .nova-modal__body,
  .nova-modal__footer {
    padding: ${spacing[4]};
  }
}

/* Animation classes for enter/exit */
.modal-enter {
  opacity: 0;
}

.modal-enter-active {
  opacity: 1;
  transition: opacity ${transitions.duration[200]} ${transitions.easing.inOut};
}

.modal-enter-active .nova-modal {
  transform: scale(1) translateY(0);
}

.modal-exit {
  opacity: 1;
}

.modal-exit-active {
  opacity: 0;
  transition: opacity ${transitions.duration[200]} ${transitions.easing.inOut};
}

.modal-exit-active .nova-modal {
  transform: scale(0.95) translateY(${spacing[4]});
}

/* Focus trap styles */
.nova-modal[data-focus-trapped] {
  outline: none;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .nova-modal-overlay,
  .nova-modal {
    transition: none;
  }
  
  .nova-modal {
    transform: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = modalStyles;
  document.head.appendChild(styleElement);
}

export default function Modal({
  children,
  isOpen = false,
  onClose,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const modalClasses = `nova-modal nova-modal--${size} ${isOpen ? 'nova-modal--open' : ''} ${className}`;
  const overlayClasses = `nova-modal-overlay ${isOpen ? 'nova-modal-overlay--open' : ''}`;

  return (
    <div 
      className={overlayClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      <div className={modalClasses}>
        {children}
      </div>
    </div>
  );
}

// Modal Header component
export function ModalHeader({ children, onClose, className = '' }) {
  return (
    <div className={`nova-modal__header ${className}`}>
      <h2 className="nova-modal__title">{children}</h2>
      {onClose && (
        <button 
          className="nova-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.207 4.207a1 1 0 0 0-1.414-1.414L8 5.586 5.207 2.793a1 1 0 0 0-1.414 1.414L6.586 7l-2.793 2.793a1 1 0 1 0 1.414 1.414L8 8.414l2.793 2.793a1 1 0 0 0 1.414-1.414L9.414 7l2.793-2.793z"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// Modal Body component
export function ModalBody({ children, noPadding = false, className = '' }) {
  const bodyClasses = `nova-modal__body ${noPadding ? 'nova-modal__body--no-padding' : ''} ${className}`;
  
  return (
    <div className={bodyClasses}>
      {children}
    </div>
  );
}

// Modal Footer component
export function ModalFooter({ children, justify = 'right', className = '' }) {
  const justifyClass = justify !== 'right' ? `nova-modal__footer--${justify}` : '';
  
  return (
    <div className={`nova-modal__footer ${justifyClass} ${className}`}>
      {children}
    </div>
  );
}
