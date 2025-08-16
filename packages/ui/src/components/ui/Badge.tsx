import React from 'react';
import './Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  badgeContent: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'default';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  badgeContent,
  color = 'primary',
  children,
  ...props
}) => (
  <span
    {...props}
    className={[props.className || 'badge', `badge--${color}`].filter(Boolean).join(' ')}
  >
    {children}
    <span className="badge-content">{badgeContent}</span>
  </span>
);
