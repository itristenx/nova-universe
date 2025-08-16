import React from 'react';
import './Alert.css';
export const Alert = ({ message, type = 'info', className = '' }) =>
  React.createElement('div', { className: `alert alert--${type} ${className}` }, message);
