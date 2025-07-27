import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'primary', className = '' }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const widthClass = `progress-bar-fill--${Math.round(percent)}`;
  return (
    <div
      className={`progress-bar progress-bar--${color} ${className}`}
      title={`Progress: ${percent}%`}
    >
      <div className={`progress-bar-fill ${widthClass}`} />
    </div>
  );
};
