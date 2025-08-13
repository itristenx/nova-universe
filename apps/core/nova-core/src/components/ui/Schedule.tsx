import React from 'react';
export const Schedule: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'action', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'action' ? '#757575' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
