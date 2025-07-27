import React from 'react';
export const Warning: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'warning', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'warning' ? '#ff9800' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 2 22 22 22 12 2" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
