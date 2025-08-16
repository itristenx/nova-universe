import React from 'react';
export const _List = ({ children, ...props }) => (React.createElement("ul", { ...props, className: props.className || 'list' }, children));
