import React from 'react';
export const CheckCircle: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'success', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'success' ? '#4caf50' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 8 12 14 8 11" />
  </svg>
);
