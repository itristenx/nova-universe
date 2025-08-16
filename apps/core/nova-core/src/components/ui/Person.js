import React from 'react';
export const Person = ({ color = 'primary', ...props }) =>
  React.createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 24,
      height: 24,
      fill: 'none',
      stroke: color === 'primary' ? '#1976d2' : 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    },
    React.createElement('circle', { cx: '12', cy: '8', r: '4' }),
    React.createElement('path', { d: 'M4 20c0-4 8-4 8-4s8 0 8 4' }),
  );
