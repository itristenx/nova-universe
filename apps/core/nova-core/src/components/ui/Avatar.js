import React from 'react';
import './Avatar.css';
export const Avatar = ({ src, alt, size = 'md', name, className = '' }) => {
  const sizeClass = `avatar-${size}`;
  return React.createElement(
    'div',
    { className: `avatar ${sizeClass} ${className}` },
    src
      ? React.createElement('img', {
          src: src,
          alt: alt || name || 'Avatar',
          className: 'avatar-img',
        })
      : React.createElement(
          'span',
          { className: 'avatar-fallback' },
          name ? name[0].toUpperCase() : '?',
        ),
  );
};
