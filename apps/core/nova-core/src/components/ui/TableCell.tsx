import React from 'react';
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  ...props
}) => (
  <td {...props} className={props.className || 'table-cell'}>
    {children}
  </td>
);
