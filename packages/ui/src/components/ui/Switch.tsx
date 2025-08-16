import React from 'react';
import './Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: ((checked: boolean) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void);
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}) => (
  <label className={`switch-container ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => {
        if (typeof onChange === 'function') {
          if (onChange._length === 1) {
            (onChange as (checked: boolean) => void)(e.target.checked);
          } else {
            (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
          }
        }
      }}
      disabled={disabled}
      className="switch-input"
    />
    <span className="switch-slider" />
    {label && <span className="switch-label">{label}</span>}
  </label>
);
