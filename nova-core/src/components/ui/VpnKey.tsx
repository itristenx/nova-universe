import React from 'react';
export const VpnKey: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'success', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'success' ? '#4caf50' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    <line x1="12" y1="15" x2="12" y2="21" />
  </svg>
);
