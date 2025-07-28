import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className="tooltip-content">{content}</span>}
    </span>
  );
};
