import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium input-label"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm input-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm input-helper">{helperText}</p>
      )}
    </div>
  );
};
