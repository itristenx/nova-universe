import React from 'react';
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  spacing?: number;
  sx?: React.CSSProperties;
}
export const Grid: React.FC<GridProps> = ({ container, item, xs, sm, md, spacing, className, style, sx = {}, children, ...props }) => {
  const classes = [className, container ? 'grid-container' : '', item ? 'grid-item' : '']
    .filter(Boolean).join(' ');
  const gridStyle = {
    ...(container && spacing ? { gap: spacing * 8 } : {}),
    ...sx,
    ...style
  };
  return <div {...props} className={classes} style={gridStyle}>{children}</div>;
};
