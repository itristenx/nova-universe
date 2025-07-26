import React from 'react';
import './Alert.css';

interface AlertProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'info', className = '' }) => (
  <div className={`alert alert--${type} ${className}`}>{message}</div>
);
