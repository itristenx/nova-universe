import React from 'react';
export const Refresh: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({
  color = 'primary',
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    stroke={color === 'primary' ? '#1976d2' : 'currentColor'}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M1 20a11 11 0 0 1 9-18h1" />
  </svg>
);
