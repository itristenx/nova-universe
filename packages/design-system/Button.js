import React from 'react';
import { colors, spacing, fontSizes } from './tokens';

export default function Button({ children, type = 'primary', ...props }) {
  const style = {
    backgroundColor: colors[type] || colors.primary,
    color: '#fff',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSizes.medium,
    border: 'none',
    borderRadius: spacing.xs,
    cursor: 'pointer',
  };
  return (
    <button style={style} {...props}>
      {children}
    </button>
  );
}
