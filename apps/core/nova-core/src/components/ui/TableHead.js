import React from 'react';
export const _TableHead = ({ children, ...props }) => (React.createElement("thead", { ...props, className: props.className || 'table-head' }, children));
