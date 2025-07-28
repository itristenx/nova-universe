import React from 'react';
export const DialogActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={props.className || 'dialog-actions'}>{children}</div>
);
