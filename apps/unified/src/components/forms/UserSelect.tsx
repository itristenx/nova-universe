import { cn } from '@utils/index';

interface UserSelectProps {
  value?: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function UserSelect({ value, onChange, placeholder, className }: UserSelectProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('input', className)}
    >
      <option value="">{placeholder || 'Select user...'}</option>
      <option value="user1">John Doe</option>
      <option value="user2">Jane Smith</option>
      <option value="user3">Bob Johnson</option>
      <option value="user4">Alice Wilson</option>
    </select>
  );
}
