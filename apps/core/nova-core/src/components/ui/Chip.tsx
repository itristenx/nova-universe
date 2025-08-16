import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'solid' | 'bordered' | 'light';
  children?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  color = 'default',
  size = 'md',
  variant = 'flat',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center rounded-full font-medium';
  const sizeClass =
    size === 'sm'
      ? 'text-xs px-2 py-0.5'
      : size === 'lg'
        ? 'text-sm px-3 py-1'
        : 'text-xs px-2.5 py-0.5';
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    primary: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    secondary: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    danger: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  };
  const p = palette[color] || palette.default;
  const variantClass =
    variant === 'bordered'
      ? `border ${p.border} ${p.text}`
      : variant === 'solid'
        ? `${p.bg} ${p.text}`
        : variant === 'light'
          ? `bg-transparent ${p.text}`
          : `${p.bg} ${p.text}`;

  return (
    <div
      {...props}
      className={`${base} ${sizeClass} ${variantClass} ${props.className || ''}`.trim()}
    >
      {children ?? label}
    </div>
  );
};
