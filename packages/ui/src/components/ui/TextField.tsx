import React from 'react';
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  endAdornment?: React.ReactNode;
  InputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}
export const TextField: React.FC<TextFieldProps> = ({
  label,
  endAdornment,
  InputProps,
  ...props
}) => (
  <div className={props.className || 'text-field-wrapper'}>
    {label && <label className="text-field-label">{label}</label>}
    <input {...props} {...InputProps} className="text-field-input" />
    {endAdornment && <span className="text-field-end-adornment">{endAdornment}</span>}
  </div>
);
