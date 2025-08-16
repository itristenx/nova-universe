import React from 'react';
import './Radio.css';

interface RadioProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  helperText,
  className = '',
}) => (
  <div className={`radio-container ${className}`}>
    {label && <span className="radio-label">{label}</span>}
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
            className="radio-input"
          />
          <span className="radio-custom" />
          <span className="radio-text">{option.label}</span>
        </label>
      ))}
    </div>
    {error && <p className="radio-error">{error}</p>}
    {helperText && !error && <p className="radio-helper">{helperText}</p>}
  </div>
);
