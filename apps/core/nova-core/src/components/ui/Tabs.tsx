import React, { useState } from 'react';
import './Tabs.css';

interface TabDef {
  label: string;
  content: React.ReactNode;
  key?: string;
}

export interface TabsProps {
  tabs?: TabDef[];
  initialIndex?: number;
  className?: string;
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> & {
  Tab?: React.FC<{ key?: string; title: React.ReactNode; children: React.ReactNode }>;
} = ({ tabs, initialIndex = 0, className = '', selectedKey, onSelectionChange, children }) => {
  const childTabs = React.Children.toArray(children) as React.ReactElement[];
  const resolvedTabs: { key: string; label: React.ReactNode; content: React.ReactNode }[] =
    tabs?.map((t, i) => ({ key: t.key ?? String(i), label: t.label, content: t.content })) ||
    childTabs.map((el, i) => ({
      key: (el.key as string) ?? String(i),
      label: (el.props as any).title,
      content: (el.props as any).children,
    }));

  const initial = selectedKey
    ? Math.max(
        0,
        resolvedTabs.findIndex((t) => t.key === selectedKey),
      )
    : initialIndex;
  const [active, setActive] = useState(initial);

  const select = (i: number) => {
    setActive(i);
    onSelectionChange?.(resolvedTabs[i].key);
  };

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-list">
        {resolvedTabs.map((tab, i) => (
          <button
            key={tab.key}
            className={`tabs-tab${i === active ? 'tabs-tab--active' : ''}`}
            onClick={() => select(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel">{resolvedTabs[active]?.content}</div>
    </div>
  );
};

Tabs.Tab = (({ children }: { children: React.ReactNode }) => <>{children}</>) as any;
