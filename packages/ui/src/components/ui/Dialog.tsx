import React from 'react';
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  maxWidth?: string;
  fullWidth?: boolean;
}
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  maxWidth,
  fullWidth,
  children,
  ...props
}) => {
  if (!open) return null;
  return (
    <div
      {...props}
      className={[props.className || 'dialog-backdrop'].filter(Boolean).join(' ')}
      onClick={onClose}
    >
      <div
        className={['dialog-content', fullWidth ? 'dialog-content--fullWidth' : '']
          .filter(Boolean)
          .join(' ')}
        style={{ maxWidth: maxWidth || undefined, ...props.style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
