import React from 'react';
import './Loader.css';
export const Loader = ({ size = 'md', color = 'primary', className = '' }) =>
  React.createElement('span', {
    className: `loader loader--${size} loader--${color} ${className}`,
  });
