import React from 'react';
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <tbody {...props} className={props.className || 'table-body'}>{children}</tbody>
);
