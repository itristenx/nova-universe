import React from 'react';
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  sx?: React.CSSProperties;
}
export const Box: React.FC<BoxProps> = ({ sx, style, children, ...props }) => (
  <div {...props} style={{ ...sx, ...style }}>
    {children}
  </div>
);
