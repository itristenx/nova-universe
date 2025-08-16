import React, { useEffect, useRef } from 'react';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children, ...props }) => {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Focus the first focusable element inside the dialog
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
        if (e.key === 'Tab') {
          // Simple focus trap
          const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!nodes || nodes.length === 0) return;
          const focusables = Array.from(nodes).filter(n => !n.hasAttribute('disabled'));
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      {...props}
      role="dialog"
      aria-modal="true"
      className={props.className || 'dialog-backdrop'}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="dialog-content"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
