import React from 'react';
export const _AlertTitle = ({ children, ...props }) => (React.createElement("div", { ...props, className: props.className || 'alert-title' }, children));
