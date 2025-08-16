import React from 'react';
import './Stepper.css';
export const Stepper = ({ steps, activeStep, className = '' }) =>
  React.createElement(
    'div',
    { className: `stepper ${className}` },
    steps.map((step, i) =>
      React.createElement(
        'div',
        {
          key: step.label,
          className: `stepper-step${i === activeStep ? ' stepper-step--active' : ''}${step.completed ? ' stepper-step--completed' : ''}`,
        },
        React.createElement('span', { className: 'stepper-label' }, step.label),
        i < steps.length - 1 && React.createElement('span', { className: 'stepper-separator' }),
      ),
    ),
  );
