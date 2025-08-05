import React from 'react';
import './Badge.css';
export const Badge = ({ label, color = 'primary', className = '' }) => (React.createElement("span", { className: `badge badge--${color} ${className}` }, label));
