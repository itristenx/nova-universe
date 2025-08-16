import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description,
  style,
}) => {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="card-title text-lg font-semibold">{title}</h3>}
          {description && <p className="card-desc mt-1 text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
