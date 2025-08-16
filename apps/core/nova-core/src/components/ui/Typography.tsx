import React from 'react';
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button'
    | 'overline';
  component?: React.ElementType;
  color?: string;
}
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component: Component = 'span',
  color,
  children,
  ...props
}) => (
  <Component
    {...props}
    style={color ? { color, ...props.style } : props.style}
    className={props.className || `typography typography--${variant}`}
  >
    {children}
  </Component>
);
