import React from 'react';
export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  color?: string;
}
export const Chip: React.FC<ChipProps> = ({ label, color, ...props }) => (
  <div {...props} className={props.className || 'chip'} style={color ? { backgroundColor: color } : {}}>{label}</div>
);
