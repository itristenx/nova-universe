import React from 'react';
export const InputLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  ...props
}) => (
  <label {...props} className={props.className || 'input-label'}>
    {children}
  </label>
);
