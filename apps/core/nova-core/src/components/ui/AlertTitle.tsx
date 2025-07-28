import React from 'react';
export const AlertTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={props.className || 'alert-title'}>{children}</div>
);
