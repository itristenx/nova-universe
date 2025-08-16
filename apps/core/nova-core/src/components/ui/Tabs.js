import React, { useState } from 'react';
import './Tabs.css';
export const Tabs = ({ tabs, initialIndex = 0, className = '' }) => {
  const [active, setActive] = useState(initialIndex);
  return React.createElement(
    'div',
    { className: `tabs ${className}` },
    React.createElement(
      'div',
      { className: 'tabs-list' },
      tabs.map((tab, i) =>
        React.createElement(
          'button',
          {
            key: tab.label,
            className: `tabs-tab${i === active ? ' tabs-tab--active' : ''}`,
            onClick: () => setActive(i),
          },
          tab.label,
        ),
      ),
    ),
    React.createElement('div', { className: 'tabs-panel' }, tabs[active].content),
  );
};
