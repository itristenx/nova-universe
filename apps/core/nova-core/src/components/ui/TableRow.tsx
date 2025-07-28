import React from 'react';
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, ...props }) => (
  <tr {...props} className={props.className || 'table-row'}>{children}</tr>
);
