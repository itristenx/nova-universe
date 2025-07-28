import React from 'react';
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
}
export const Dialog: React.FC<DialogProps> = ({ open, onClose, children, ...props }) => {
  if (!open) return null;
  return (
    <div {...props} className={props.className || 'dialog-backdrop'} onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
};
