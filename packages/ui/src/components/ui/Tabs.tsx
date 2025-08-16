import React, { useState } from 'react';
import './Tabs.css';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialIndex?: number;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialIndex = 0, className = '' }) => {
  const [active, setActive] = useState(initialIndex);
  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-list">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            className={`tabs-tab${i === active ? 'tabs-tab--active' : ''}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel">{tabs[active].content}</div>
    </div>
  );
};
