import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
        className={`
          h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      />
      <label className={`ml-2 block text-sm text-gray-900 ${disabled ? 'text-gray-500' : ''}`}>
        {label}
      </label>
    </div>
  );
};
