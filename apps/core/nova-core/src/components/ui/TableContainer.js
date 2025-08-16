import React from 'react';
export const _TableContainer = ({ children, component: Component = 'div', ...props }) => (React.createElement(Component, { ...props, className: props.className || 'table-container' }, children));
