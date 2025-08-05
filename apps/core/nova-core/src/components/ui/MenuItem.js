import React from 'react';
export const MenuItem = ({ children, value, ...props }) => (React.createElement("li", { ...props, className: props.className || 'menu-item', "data-value": value }, children));
