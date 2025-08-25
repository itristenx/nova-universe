import { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        onChange([...value, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        'flex min-h-[42px] flex-wrap gap-2 rounded-lg border border-gray-300 p-2 dark:border-gray-600',
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-nova-100 text-nova-800 dark:bg-nova-900 dark:text-nova-200 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
        >
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-nova-600 ml-1">
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
    </div>
  );
}
