import React from 'react';
export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, ...props }) => (
  <table {...props} className={props.className || 'table'}>{children}</table>
);
