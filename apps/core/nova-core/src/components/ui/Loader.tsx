import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className = '' }) => (
  <span className={`loader loader--${size} loader--${color} ${className}`} />
);
