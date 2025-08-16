import React from 'react';
export const DialogTitle = ({ children, ...props }) =>
  React.createElement('div', { ...props, className: props.className || 'dialog-title' }, children);
