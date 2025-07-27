import React from 'react';
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sx?: React.CSSProperties;
}
export const CardContent: React.FC<CardContentProps> = ({ sx = {}, style, children, ...props }) => (
  <div {...props} className={props.className || 'card-content'} style={{ ...sx, ...style }}>{children}</div>
);
