import React from 'react';
export const Person: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = 'primary', ...props }) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={color === 'primary' ? '#1976d2' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
  </svg>
);
