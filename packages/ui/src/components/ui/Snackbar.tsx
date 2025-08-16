import React, { useEffect } from 'react';
import './Snackbar.css';

interface SnackbarProps {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  open,
  onClose,
  duration = 3000,
  type = 'info',
  className = '',
}) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);
  if (!open) return null;
  return <div className={`snackbar snackbar--${type} ${className}`}>{message}</div>;
};
