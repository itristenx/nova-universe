import React from 'react';
export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  color?: string;
  icon?: React.ReactNode;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  sx?: React.CSSProperties;
}
export const Chip: React.FC<ChipProps> = ({ label, color, icon, size = 'medium', variant = 'filled', sx = {}, style, ...props }) => (
  <div
    {...props}
    className={[
      props.className || 'chip',
      `chip--${size}`,
      `chip--${variant}`
    ].filter(Boolean).join(' ')}
    style={{ ...sx, ...(color ? { backgroundColor: color } : {}), ...style }}
  >
    {icon && <span className="chip-icon">{icon}</span>}
    {label}
  </div>
);
