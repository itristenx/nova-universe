import React from 'react';
export const List = ({ children, ...props }) => (React.createElement("ul", { ...props, className: props.className || 'list' }, children));
