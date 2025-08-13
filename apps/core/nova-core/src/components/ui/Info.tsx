import React from 'react';
export const Info: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'info', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'info' ? '#2196f3' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="1" />
  </svg>
);
