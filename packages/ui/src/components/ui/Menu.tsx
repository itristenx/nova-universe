import React, { useState, useRef, useEffect } from 'react';
import './Menu.css';

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface MenuProps {
  items: MenuItem[];
  buttonLabel: string;
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({ items, buttonLabel, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return (
    <div className={`menu ${className}`} ref={ref}>
      <button className="menu-btn" onClick={() => setOpen(v => !v)}>{buttonLabel}</button>
      {open && (
        <div className="menu-list">
          {items.map(item => (
            <button key={item.label} className="menu-item" onClick={() => { item.onClick(); setOpen(false); }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
