import React from 'react';

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: number;
}

export const Paper: React.FC<PaperProps> = ({ elevation = 1, children, ...props }) => (
  <div {...props} className={[props.className || 'paper', `paper-elevation-${elevation}`].filter(Boolean).join(' ')}>
    {children}
  </div>
);
