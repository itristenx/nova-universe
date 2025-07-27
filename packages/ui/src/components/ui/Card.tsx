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
          {title && <h3 className="text-lg font-semibold card-title">{title}</h3>}
          {description && <p className="text-sm mt-1 card-desc">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
