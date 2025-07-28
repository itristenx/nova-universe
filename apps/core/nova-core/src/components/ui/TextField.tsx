import React from 'react';
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  endAdornment?: React.ReactNode;
}
export const TextField: React.FC<TextFieldProps> = ({ label, endAdornment, ...props }) => (
  <div className={props.className || 'text-field-wrapper'}>
    {label && <label className="text-field-label">{label}</label>}
    <input {...props} className="text-field-input" />
    {endAdornment && <span className="text-field-end-adornment">{endAdornment}</span>}
  </div>
);
