import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  radius?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ size = 'md', radius = 'sm', className = '' }) => {
  const sizeClass = `skeleton--${size}`;
  const radiusClass = `skeleton-radius--${radius}`;
  return (
    <span className={`skeleton ${sizeClass} ${radiusClass} ${className}`} />
  );
};
