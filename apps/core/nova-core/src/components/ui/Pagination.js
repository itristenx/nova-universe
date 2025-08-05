import React from 'react';
import './Pagination.css';
export const Pagination = ({ page, pageCount, onPageChange, className = '' }) => {
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    return (React.createElement("nav", { className: `pagination ${className}`, "aria-label": "Pagination" },
        React.createElement("button", { className: "pagination-btn", onClick: () => onPageChange(page - 1), disabled: page === 1, "aria-label": "Previous page" }, "<"),
        pages.map(p => (React.createElement("button", { key: p, className: `pagination-btn${p === page ? ' pagination-btn--active' : ''}`, onClick: () => onPageChange(p), "aria-current": p === page ? 'page' : undefined }, p))),
        React.createElement("button", { className: "pagination-btn", onClick: () => onPageChange(page + 1), disabled: page === pageCount, "aria-label": "Next page" }, ">")));
};
