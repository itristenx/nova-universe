import React from 'react';
export const DialogActions = ({ children, ...props }) =>
  React.createElement(
    'div',
    { ...props, className: props.className || 'dialog-actions' },
    children,
  );
