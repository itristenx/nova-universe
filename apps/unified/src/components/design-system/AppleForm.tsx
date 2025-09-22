import { ReactNode } from 'react';
import { cn } from '@utils/index';

interface AppleInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
  icon?: ReactNode;
  className?: string;
}

interface AppleTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
  rows?: number;
  className?: string;
}

interface AppleSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
  className?: string;
}

export function AppleInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  help,
  icon,
  className,
}: AppleInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            'block w-full rounded-xl border',
            'px-4 py-3 text-sm',
            'transition-all duration-200 ease-apple',
            'focus:outline-none focus:ring-2 focus:ring-nova-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            error
              ? 'border-error-300 bg-error-50 dark:border-error-600 dark:bg-error-900/20'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'text-gray-900 dark:text-gray-100',
          )}
        />
      </div>
      {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}
      {help && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  );
}

export function AppleTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  help,
  rows = 4,
  className,
}: AppleTextareaProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={cn(
          'block w-full rounded-xl border',
          'px-4 py-3 text-sm',
          'transition-all duration-200 ease-apple',
          'focus:outline-none focus:ring-2 focus:ring-nova-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'resize-y min-h-[100px]',
          error
            ? 'border-error-300 bg-error-50 dark:border-error-600 dark:bg-error-900/20'
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'text-gray-900 dark:text-gray-100',
        )}
      />
      {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}
      {help && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  );
}

export function AppleSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  help,
  className,
}: AppleSelectProps) {
  const selectId = `apple-select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          'block w-full rounded-xl border',
          'px-4 py-3 text-sm',
          'transition-all duration-200 ease-apple',
          'focus:outline-none focus:ring-2 focus:ring-nova-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-error-300 bg-error-50 dark:border-error-600 dark:bg-error-900/20'
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-error-600 dark:text-error-400">{error}</p>}
      {help && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  );
}

interface AppleFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function AppleForm({ children, onSubmit, className }: AppleFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
      {children}
    </form>
  );
}

interface AppleFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AppleFormSection({
  title,
  description,
  children,
  className,
}: AppleFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}