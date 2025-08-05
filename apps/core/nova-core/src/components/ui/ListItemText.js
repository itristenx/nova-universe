import React from 'react';
export const ListItemText = ({ primary, secondary }) => (React.createElement("div", { className: "list-item-text" },
    primary && React.createElement("div", { className: "list-item-text-primary" }, primary),
    secondary && React.createElement("div", { className: "list-item-text-secondary" }, secondary)));
