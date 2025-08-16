import React from 'react';
import { Button as HeroButton } from '@heroui/react';
export const Button = ({
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
  return React.createElement(
    HeroButton,
    {
      color: mappedVariant,
      size: size,
      isLoading: isLoading,
      startContent: startIcon,
      endContent: endIcon,
      className: className,
      disabled: disabled,
      ...props,
    },
    children,
  );
};
