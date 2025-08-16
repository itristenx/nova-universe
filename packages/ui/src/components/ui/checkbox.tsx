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
        className={`text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} `}
      />
      <label
        className={`ml-2 block text-sm ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
      >
        {label}
      </label>
    </div>
  );
};
