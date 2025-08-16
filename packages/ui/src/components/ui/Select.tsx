import React from 'react';
import './Select.css';

interface SelectProps {
  label?: string;
  value: string;
  onChange: ((value: string) => void) | ((e: React.ChangeEvent<HTMLSelectElement>) => void);
  options?: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  children,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof onChange === 'function') {
      if (onChange.length === 1 && typeof e.target.value === 'string') {
        // If expecting value, pass value
        (onChange as (value: string) => void)(e.target.value);
      } else {
        // If expecting event, pass event
        (onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void)(e);
      }
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="select-label block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label || placeholder}
        className="select block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none sm:text-sm"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options &&
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        {children}
      </select>
      {error && <p className="select-error text-sm">{error}</p>}
      {helperText && !error && <p className="select-helper text-sm">{helperText}</p>}
    </div>
  );
};
