import React from 'react';
import { Button as HeroButton } from '@heroui/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'success' | 'warning' | 'contained'; // 'contained' for MUI compatibility
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Map 'contained' to 'primary' for compatibility
  const mappedVariant = variant === 'contained' ? 'primary' : variant;
  return (
    <HeroButton
      color={mappedVariant as any}
      size={size}
      isLoading={isLoading}
      startContent={startIcon}
      endContent={endIcon}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </HeroButton>
  );
};
