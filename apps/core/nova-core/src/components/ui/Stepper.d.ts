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
export declare const Stepper: React.FC<StepperProps>;
export {};
//# sourceMappingURL=Stepper.d.ts.map
