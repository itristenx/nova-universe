import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw] h-[95vh]',
};

/**
 * Modal - Dialog component with backdrop, animations, and focus trap
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Handle tab key for focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusableElements) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleTab);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                className={`
                  relative w-full ${sizeStyles[size]}
                  glass-heavy
                  rounded-apple-lg
                  shadow-glass-xl
                  border border-gray-200/10 dark:border-gray-700/10
                  ${className}
                `}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200/20 dark:border-gray-700/20">
                    <div className="flex-1">
                      {title && (
                        <h2 className="text-xl font-sf-display font-semibold text-gray-900 dark:text-white">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="mt-1 text-sm font-sf-text text-gray-600 dark:text-gray-400">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="
                          ml-4 p-2 rounded-apple-sm
                          text-gray-400 dark:text-gray-500
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          hover:text-gray-600 dark:hover:text-gray-300
                          transition-colors duration-200
                        "
                        type="button"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={`p-6 ${size === 'full' ? 'overflow-y-auto max-h-[calc(95vh-200px)]' : ''}`}>
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Modal footer button helpers
 */
export interface ModalButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ModalButton: React.FC<ModalButtonProps> = ({
  onClick,
  children,
  variant = 'secondary',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-apple-blue dark:bg-apple-blue-dark text-white hover:bg-apple-blue/90 dark:hover:bg-apple-blue-dark/90',
    secondary: 'glass text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-error-500 text-white hover:bg-error-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-apple-sm
        font-sf-text font-medium text-sm
        transition-all duration-400 ease-apple
        hover-lift
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      type="button"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Confirmation modal hook
 */
interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
}

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setIsOpen(false);
  };

  const ConfirmModal = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options?.title}
      size="sm"
      footer={
        <>
          <ModalButton onClick={handleCancel}>
            {options?.cancelLabel || 'Cancel'}
          </ModalButton>
          <ModalButton onClick={handleConfirm} variant={options?.variant || 'primary'}>
            {options?.confirmLabel || 'Confirm'}
          </ModalButton>
        </>
      }
    >
      <p className="font-sf-text text-gray-700 dark:text-gray-300">
        {options?.message}
      </p>
    </Modal>
  );

  return { confirm, ConfirmModal };
};
