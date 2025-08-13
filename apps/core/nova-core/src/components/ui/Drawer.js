import React from 'react';
import './Drawer.css';
export const Drawer = ({ open, onClose, side = 'right', children, className = '' }) => (React.createElement("div", { className: `drawer drawer--${side}${open ? ' drawer--open' : ''} ${className}` },
    React.createElement("div", { className: "drawer-backdrop", onClick: onClose }),
    React.createElement("div", { className: "drawer-content" }, children)));
