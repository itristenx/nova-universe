import React from 'react';
import './Stepper.css';

interface Step {
  label: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  activeStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStep, className = '' }) => (
  <div className={`stepper ${className}`}>
    {steps.map((step, i) => (
      <div key={step.label} className={`stepper-step${i === activeStep ? ' stepper-step--active' : ''}${step.completed ? ' stepper-step--completed' : ''}`}> 
        <span className="stepper-label">{step.label}</span>
        {i < steps.length - 1 && <span className="stepper-separator" />}
      </div>
    ))}
  </div>
);
