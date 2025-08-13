import React from 'react';
export const IconButton = ({ children, size = 'medium', ...props }) => (React.createElement("button", { ...props, className: props.className || `icon-button icon-button--${size}` }, children));
