import React from 'react';
import './Card.css';
export const Card = ({ children, className = '', title, description, }) => {
    return (React.createElement("div", { className: `card ${className}` },
        (title || description) && (React.createElement("div", { className: "mb-4" },
            title && React.createElement("h3", { className: "text-lg font-semibold card-title" }, title),
            description && React.createElement("p", { className: "text-sm mt-1 card-desc" }, description))),
        children));
};
