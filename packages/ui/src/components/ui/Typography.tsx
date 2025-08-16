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
  fontWeight?: string | number;
  gutterBottom?: boolean;
  sx?: React.CSSProperties;
}
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component: Component = 'span',
  color,
  fontWeight,
  gutterBottom = false,
  sx = {},
  children,
  ...props
}) => (
  <Component
    {...props}
    style={{
      ...sx,
      ...(color ? { color } : {}),
      ...(fontWeight ? { fontWeight } : {}),
      ...props.style,
    }}
    className={[
      props.className || `typography typography--${variant}`,
      gutterBottom ? 'typography-gutter-bottom' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </Component>
);
