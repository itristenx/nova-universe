import React from 'react';
export const _Chip = ({ label, color, ...props }) => (React.createElement("div", { ...props, className: props.className || 'chip', style: color ? { backgroundColor: color } : {} }, label));
