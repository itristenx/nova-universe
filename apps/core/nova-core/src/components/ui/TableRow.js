import React from 'react';
export const _TableRow = ({ children, ...props }) => (React.createElement("tr", { ...props, className: props.className || 'table-row' }, children));
