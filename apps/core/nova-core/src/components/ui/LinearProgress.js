import React from 'react';
export const LinearProgress = ({ value = 0, color = '#1976d2', ...props }) => (React.createElement("div", { ...props, className: props.className || 'linear-progress' },
    React.createElement("div", { className: "linear-progress-bar", style: { width: `${value}%`, background: color, height: 4 } })));
