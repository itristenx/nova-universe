import React from 'react';
export const _TableCell = ({ children, ...props }) => (React.createElement("td", { ...props, className: props.className || 'table-cell' }, children));
