import React from 'react';
export const CardContent = ({ children, ...props }) => (React.createElement("div", { ...props, className: props.className || 'card-content' }, children));
