import React from 'react';
import './Pagination.css';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onPageChange, className = '' }) => {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className={`pagination ${className}`} aria-label="Pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &lt;
      </button>
      {pages.map(p => (
        <button
          key={p}
          className={`pagination-btn${p === page ? ' pagination-btn--active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Next page"
      >
        &gt;
      </button>
    </nav>
  );
};
