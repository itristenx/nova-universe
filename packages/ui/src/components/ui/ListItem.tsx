import React from 'react';

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dense?: boolean;
  divider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({ children, dense, divider, ...props }) => (
  <li
    {...props}
    className={[
      props.className || 'list-item',
      dense ? 'list-item--dense' : '',
      divider ? 'list-item--divider' : ''
    ].filter(Boolean).join(' ')}
  >
    {children}
  </li>
);
