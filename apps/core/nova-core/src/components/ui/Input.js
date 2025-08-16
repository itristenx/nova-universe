import React from 'react';
import './Input.css';
export const Input = ({ label, error, helperText, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return React.createElement(
    'div',
    { className: 'space-y-1' },
    label &&
      React.createElement(
        'label',
        { htmlFor: inputId, className: 'block text-sm font-medium input-label' },
        label,
      ),
    React.createElement('input', {
      id: inputId,
      className: `input ${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`,
      ...props,
    }),
    error && React.createElement('p', { className: 'text-sm input-error' }, error),
    helperText &&
      !error &&
      React.createElement('p', { className: 'text-sm input-helper' }, helperText),
  );
};
