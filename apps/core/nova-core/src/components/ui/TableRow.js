import React from 'react';
export const TableRow = ({ children, ...props }) =>
  React.createElement('tr', { ...props, className: props.className || 'table-row' }, children);
