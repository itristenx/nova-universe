import React, { useState } from 'react';
import './Tooltip.css';
export const Tooltip = ({ content, children, className = '' }) => {
  const [visible, setVisible] = useState(false);
  return React.createElement(
    'span',
    {
      className: `tooltip-wrapper ${className}`,
      onMouseEnter: () => setVisible(true),
      onMouseLeave: () => setVisible(false),
    },
    children,
    visible && React.createElement('span', { className: 'tooltip-content' }, content),
  );
};
