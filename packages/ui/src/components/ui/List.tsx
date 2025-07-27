import React from 'react';
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  dense?: boolean;
}
export const List: React.FC<ListProps> = ({ children, dense, ...props }) => (
  <ul {...props} className={[props.className || 'list', dense ? 'list--dense' : ''].filter(Boolean).join(' ')}>{children}</ul>
);
