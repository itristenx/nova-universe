import React from 'react';
export const ListItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ children, ...props }) => (
  <li {...props} className={props.className || 'list-item'}>{children}</li>
);
