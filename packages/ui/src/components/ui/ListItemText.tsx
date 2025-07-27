import React from 'react';
export interface ListItemTextProps {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
}
export const ListItemText: React.FC<ListItemTextProps> = ({ primary, secondary }) => (
  <div className="list-item-text">
    {primary && <div className="list-item-text-primary">{primary}</div>}
    {secondary && <div className="list-item-text-secondary">{secondary}</div>}
  </div>
);
