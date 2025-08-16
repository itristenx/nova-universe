import React from 'react';
export const _Dialog = ({ open, onClose, children, ...props }) => {
    if (!open)
        return null;
    return (React.createElement("div", { ...props, className: props.className || 'dialog-backdrop', onClick: onClose },
        React.createElement("div", { className: "dialog-content", onClick: e => e.stopPropagation() }, children)));
};
