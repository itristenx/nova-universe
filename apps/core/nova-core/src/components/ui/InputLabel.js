import React from 'react';
export const InputLabel = ({ children, ...props }) => (React.createElement("label", { ...props, className: props.className || 'input-label' }, children));
