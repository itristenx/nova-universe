import React from 'react';
export const List: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ children, ...props }) => (
  <ul {...props} className={props.className || 'list'}>
    {children}
  </ul>
);
