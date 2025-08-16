import React from 'react';
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  sx?: React.CSSProperties;
  display?: React.CSSProperties['display'];
  alignItems?: React.CSSProperties['alignItems'];
  gap?: React.CSSProperties['gap'];
}
export const Box: React.FC<BoxProps> = ({
  sx = {},
  style,
  display,
  alignItems,
  gap,
  children,
  ...props
}) => (
  <div
    {...props}
    style={{
      display,
      alignItems,
      gap,
      ...sx,
      ...style,
    }}
  >
    {children}
  </div>
);
