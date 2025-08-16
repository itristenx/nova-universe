import React from 'react';
export const MonitorHeart = ({ color = 'primary', ...props }) =>
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
    React.createElement('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }),
    React.createElement('polyline', { points: '8 16 10 12 14 18 16 14' }),
    React.createElement('path', { d: 'M8 8h.01' }),
  );
