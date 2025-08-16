import React from 'react';
export const ListItemIcon: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div {...props} className={props.className || 'list-item-icon'}>
    {children}
  </div>
);
