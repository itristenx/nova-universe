import React from 'react';

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ label, selected = false, icon, ...props }) => (
  <button
    {...props}
    className={[props.className || 'tab', selected ? 'tab--selected' : '']
      .filter(Boolean)
      .join(' ')}
  >
    {icon && <span className="tab-icon">{icon}</span>}
    {label}
  </button>
);
