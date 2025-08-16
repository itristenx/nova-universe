import React from 'react';
import './ProgressBar.css';
export const ProgressBar = ({ value, max = 100, color = 'primary', className = '' }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const widthClass = `progress-bar-fill--${Math.round(percent)}`;
  return React.createElement(
    'div',
    {
      className: `progress-bar progress-bar--${color} ${className}`,
      title: `Progress: ${percent}%`,
    },
    React.createElement('div', { className: `progress-bar-fill ${widthClass}` }),
  );
};
