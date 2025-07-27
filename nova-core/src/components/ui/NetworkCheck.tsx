import React from 'react';
export const NetworkCheck: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'success', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'success' ? '#4caf50' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 21h22M12 17c-4.418 0-8-1.79-8-4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8c0 2.21-3.582 4-8 4z" />
    <polyline points="16 11 12 15 8 11" />
  </svg>
);
