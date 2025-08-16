import React from 'react';
export const _ListItem = ({ children, ...props }) => (React.createElement("li", { ...props, className: props.className || 'list-item' }, children));
