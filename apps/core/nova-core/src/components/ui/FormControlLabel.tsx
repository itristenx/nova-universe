import React from 'react';
export interface FormControlLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  control: React.ReactNode;
  label: React.ReactNode;
}
export const FormControlLabel: React.FC<FormControlLabelProps> = ({ control, label, ...props }) => (
  <label {...props} className={props.className || 'form-control-label'}>
    {control}
    <span className="form-control-label-text">{label}</span>
  </label>
);
