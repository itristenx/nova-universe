import React from 'react';
export const Group = ({ color = 'primary', ...props }) =>
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
    React.createElement('circle', { cx: '7', cy: '8', r: '3' }),
    React.createElement('circle', { cx: '17', cy: '8', r: '3' }),
    React.createElement('path', { d: 'M2 20c0-2.5 5-2.5 5-2.5s5 0 5 2.5' }),
    React.createElement('path', { d: 'M12 20c0-2.5 5-2.5 5-2.5s5 0 5 2.5' }),
  );
