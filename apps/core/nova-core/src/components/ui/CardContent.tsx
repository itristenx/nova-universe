import React from 'react';
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} className={props.className || 'card-content'}>{children}</div>
);
