import React, { useState } from 'react';
import './Tooltip.css';

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  title: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ title, children, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      {...props}
      className={[props.className || 'tooltip-wrapper'].filter(Boolean).join(' ')}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className="tooltip-content">{title}</span>}
    </span>
  );
};
