import React from 'react';
export const ListItemIcon = ({ children, ...props }) => (React.createElement("div", { ...props, className: props.className || 'list-item-icon' }, children));
