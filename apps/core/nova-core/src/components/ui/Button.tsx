import React from 'react';
import { Button as HeroButton } from '@heroui/react';

interface ButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'default'
    | 'success'
    | 'warning'
    | 'contained'
    | 'light'
    | 'flat'
    | 'bordered'
    | 'ghost'
    | 'shadow';
  color?: 'primary' | 'secondary' | 'danger' | 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onPress?: () => void;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  color,
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  startContent,
  endContent,
  children,
  className = '',
  disabled,
  onClick,
  onPress,
  type,
  title,
  style,
}) => {
  const variantAsColor = (
    variant === 'contained' ? 'primary' :
    variant === 'light' || variant === 'flat' || variant === 'bordered' || variant === 'ghost' || variant === 'shadow'
      ? undefined
      : (variant as ButtonProps['color'])
  );

  const heroColor = color || variantAsColor || 'default';
  const heroVariant = (
    variant === 'light' || variant === 'flat' || variant === 'bordered' || variant === 'ghost' || variant === 'shadow'
      ? (variant as 'light' | 'flat' | 'bordered' | 'ghost' | 'shadow')
      : undefined
  );

  const heroStart = startContent ?? startIcon;
  const heroEnd = endContent ?? endIcon;
  const handle = onClick ?? onPress;

  return (
    <HeroButton
      color={heroColor as any}
      variant={heroVariant as any}
      size={size}
      isLoading={isLoading}
      startContent={heroStart}
      endContent={heroEnd}
      className={className}
      isDisabled={disabled}
      onPress={handle as any}
      type={type}
      title={title as any}
      style={style as any}
    >
      {children}
    </HeroButton>
  );
};
