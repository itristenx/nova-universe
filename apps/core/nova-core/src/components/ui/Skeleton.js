import React from 'react';
import './Skeleton.css';
export const Skeleton = ({ size = 'md', radius = 'sm', className = '' }) => {
    const sizeClass = `skeleton--${size}`;
    const radiusClass = `skeleton-radius--${radius}`;
    return (React.createElement("span", { className: `skeleton ${sizeClass} ${radiusClass} ${className}` }));
};
