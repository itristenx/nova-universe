import React from 'react';
export const Typography = ({ variant = 'body1', component: Component = 'span', color, children, ...props }) => (React.createElement(Component, { ...props, style: color ? { color, ...props.style } : props.style, className: props.className || `typography typography--${variant}` }, children));
