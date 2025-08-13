import React from 'react';
export const ListItem = ({ children, ...props }) => (React.createElement("li", { ...props, className: props.className || 'list-item' }, children));
