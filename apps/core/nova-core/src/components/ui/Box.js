import React from 'react';
export const Box = ({ sx, style, children, ...props }) => (React.createElement("div", { ...props, style: { ...sx, ...style } }, children));
