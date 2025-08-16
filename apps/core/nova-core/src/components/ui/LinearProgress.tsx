import React from 'react';
export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: string;
}
export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  color = '#1976d2',
  ...props
}) => (
  <div {...props} className={props.className || 'linear-progress'}>
    <div
      className="linear-progress-bar"
      style={{ width: `${value}%`, background: color, height: 4 }}
    />
  </div>
);
