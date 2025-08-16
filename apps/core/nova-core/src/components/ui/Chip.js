import React from 'react';
export const Chip = ({ label, color, ...props }) =>
  React.createElement(
    'div',
    {
      ...props,
      className: props.className || 'chip',
      style: color ? { backgroundColor: color } : {},
    },
    label,
  );
