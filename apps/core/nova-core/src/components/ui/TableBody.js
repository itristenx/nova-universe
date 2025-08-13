import React from 'react';
export const TableBody = ({ children, ...props }) => (React.createElement("tbody", { ...props, className: props.className || 'table-body' }, children));
