import React from 'react';
export const TableContainer: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { component?: React.ElementType }
> = ({ children, component: Component = 'div', ...props }) => (
  <Component {...props} className={props.className || 'table-container'}>
    {children}
  </Component>
);
