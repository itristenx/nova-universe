import React from 'react';
export const TrendingUp: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'primary', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'primary' ? '#1976d2' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
