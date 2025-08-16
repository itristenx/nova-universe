import React from 'react';
export const FormControl: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => (
  <div {...props} className={props.className || 'form-control'}>
    {children}
  </div>
);
