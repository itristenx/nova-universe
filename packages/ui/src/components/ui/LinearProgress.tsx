import React from 'react';
export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: string;
  variant?: 'determinate' | 'indeterminate';
}
export const LinearProgress: React.FC<LinearProgressProps> = ({ value = 0, color = '#1976d2', variant = 'indeterminate', ...props }) => (
  <div {...props} className={props.className || 'linear-progress'}>
    {variant === 'determinate' ? (
      <div className="linear-progress-bar" style={{ width: `${value}%`, background: color, height: 4 }} />
    ) : (
      <div className="linear-progress-bar linear-progress-bar--indeterminate" style={{ background: color, height: 4 }} />
    )}
  </div>
);
