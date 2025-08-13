import React from 'react';
export const Table = ({ children, ...props }) => (React.createElement("table", { ...props, className: props.className || 'table' }, children));
