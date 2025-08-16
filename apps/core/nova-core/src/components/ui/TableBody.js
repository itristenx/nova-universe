import React from 'react';
export const _TableBody = ({ children, ...props }) => (React.createElement("tbody", { ...props, className: props.className || 'table-body' }, children));
