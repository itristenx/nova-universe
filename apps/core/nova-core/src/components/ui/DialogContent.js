import React from 'react';
export const DialogContent = ({ children, ...props }) =>
  React.createElement(
    'div',
    { ...props, className: props.className || 'dialog-content-inner' },
    children,
  );
