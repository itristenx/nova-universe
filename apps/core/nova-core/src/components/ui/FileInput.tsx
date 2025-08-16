import React, { useRef } from 'react';
import { Button } from './Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileInputProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  accept,
  onChange,
  disabled = false,
  helperText,
  error,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-center space-x-3">
        <Button variant="secondary" onClick={handleButtonClick} disabled={disabled} type="button">
          <CloudArrowUpIcon className="mr-2 h-4 w-4" />
          Choose File
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-label={label}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
