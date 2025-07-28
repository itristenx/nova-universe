import React from 'react';
import './Badge.css';

interface BadgeProps {
  label: string;
  color?: 'primary' | 'secondary' | 'accent' | 'green' | 'red' | 'yellow' | 'muted';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = 'primary', className = '' }) => (
  <span className={`badge badge--${color} ${className}`}>{label}</span>
);
