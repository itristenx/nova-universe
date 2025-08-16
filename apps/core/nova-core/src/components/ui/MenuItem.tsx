import React from 'react';
export interface MenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value?: string;
}
export const MenuItem: React.FC<MenuItemProps> = ({ children, value, ...props }) => (
  <li {...props} className={props.className || 'menu-item'} data-value={value}>
    {children}
  </li>
);
