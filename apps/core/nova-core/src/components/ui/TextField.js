import React from 'react';
export const TextField = ({ label, endAdornment, ...props }) =>
  React.createElement(
    'div',
    { className: props.className || 'text-field-wrapper' },
    label && React.createElement('label', { className: 'text-field-label' }, label),
    React.createElement('input', { ...props, className: 'text-field-input' }),
    endAdornment &&
      React.createElement('span', { className: 'text-field-end-adornment' }, endAdornment),
  );
