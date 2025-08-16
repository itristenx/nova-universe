import React from 'react';

export interface AccessibleTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  caption?: string;
}

export const Table: React.FC<AccessibleTableProps> = ({ children, caption, ...props }) => (
  <table {...props} className={props.className || 'table'}>
    {caption ? <caption className="sr-only">{caption}</caption> : null}
    {children}
  </table>
);
