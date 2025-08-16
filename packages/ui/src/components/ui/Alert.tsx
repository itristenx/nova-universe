import React from 'react';
import './Alert.css';

interface AlertProps {
  message?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  sx?: React.CSSProperties;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  message,
  severity = 'info',
  className = '',
  sx = {},
  style,
  children,
  onClose,
}) => (
  <div className={`alert alert--${severity} ${className}`} style={{ ...sx, ...style }}>
    {onClose && (
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    )}
    {children || message}
  </div>
);
