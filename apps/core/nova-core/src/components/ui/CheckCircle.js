import React from 'react';
export const CheckCircle = ({ color = 'success', ...props }) =>
  React.createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 24,
      height: 24,
      fill: 'none',
      stroke: color === 'success' ? '#4caf50' : 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('polyline', { points: '16 8 12 14 8 11' }),
  );
