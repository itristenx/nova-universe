import React from 'react';
export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div {...props} className={props.className || 'dialog-content-inner'}>
    {children}
  </div>
);
