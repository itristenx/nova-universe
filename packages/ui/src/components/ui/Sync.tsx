import React from 'react';
export const Sync: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({
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
    <path d="M21 12a9 9 0 1 1-3-7.7" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);
