import React from 'react';
export const FormControl = ({ children, ...props }) =>
  React.createElement('div', { ...props, className: props.className || 'form-control' }, children);
