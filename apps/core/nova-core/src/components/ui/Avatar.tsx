import React from 'react';
import './Avatar.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', name, className = '' }) => {
  const sizeClass = `avatar-${size}`;
  return (
    <div className={`avatar ${sizeClass} ${className}`}>
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="avatar-img" />
      ) : (
        <span className="avatar-fallback">{name ? name[0].toUpperCase() : '?'}</span>
      )}
    </div>
  );
};
