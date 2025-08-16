import React from 'react';
import './Drawer.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  side = 'right',
  children,
  className = '',
}) => (
  <div className={`drawer drawer--${side}${open ? 'drawer--open' : ''} ${className}`}>
    <div className="drawer-backdrop" onClick={onClose} />
    <div className="drawer-content">{children}</div>
  </div>
);
