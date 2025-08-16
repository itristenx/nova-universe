import React from 'react';
export const _ListItemText = ({ primary, secondary }) => (React.createElement("div", { className: "list-item-text" },
    primary && React.createElement("div", { className: "list-item-text-primary" }, primary),
    secondary && React.createElement("div", { className: "list-item-text-secondary" }, secondary)));
