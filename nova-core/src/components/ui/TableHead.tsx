import React from 'react';
export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <thead {...props} className={props.className || 'table-head'}>{children}</thead>
);
