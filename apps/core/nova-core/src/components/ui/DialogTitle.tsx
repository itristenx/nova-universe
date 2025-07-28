import React from 'react';
export const DialogTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={props.className || 'dialog-title'}>{children}</div>
);
