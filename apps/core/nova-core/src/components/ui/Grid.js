import React from 'react';
export const _Grid = ({ container, item, spacing, className, style, children, ...props }) => {
    const classes = [className, container ? 'grid-container' : '', item ? 'grid-item' : '']
        .filter(Boolean).join(' ');
    const gridStyle = {
        ...(container && spacing ? { gap: spacing * 8 } : {}),
        ...style
    };
    return React.createElement("div", { ...props, className: classes, style: gridStyle }, children);
};
