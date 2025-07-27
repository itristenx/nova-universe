import React from 'react';
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
}
export const IconButton: React.FC<IconButtonProps> = ({ children, size = 'medium', ...props }) => (
  <button {...props} className={props.className || `icon-button icon-button--${size}`}>{children}</button>
);
